use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
#[cfg(not(target_os = "android"))]
use keyring::Entry;
use rusqlite::{params, Connection, OptionalExtension, Transaction};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    cmp::Ordering,
    fs,
    path::{Path, PathBuf},
};
use tauri::{AppHandle, Manager};
use time::{format_description::well_known::Rfc3339, Duration, OffsetDateTime};

const KEYRING_SERVICE: &str = "app.twofree.finance";
const DATABASE_KEY_ACCOUNT: &str = "local-database-key-v1";
const RUNTIME_CONFIG_ACCOUNT: &str = "runtime-configuration-v1";

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CapabilityReport {
    database: &'static str,
    key_storage: &'static str,
    cipher_version: String,
    database_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeConfiguration {
    mode: String,
    api_url: Option<String>,
    sync_enabled: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProductRecord {
    id: String,
    kind: String,
    value: Value,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PortableEnvelope {
    format: String,
    version: u8,
    exported_at: String,
    accounts: Vec<Value>,
    transactions: Vec<Value>,
    records: Vec<ProductRecord>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PendingChange {
    operation_id: String,
    entity_kind: String,
    entity_id: String,
    operation: String,
    version: i64,
    occurred_at: String,
    payload: Value,
    attempts: i64,
}

#[cfg(not(target_os = "android"))]
fn secret_entry(account: &str) -> Result<Entry, String> {
    Entry::new(KEYRING_SERVICE, account)
        .map_err(|error| format!("El almacén seguro del sistema no está disponible: {error}"))
}

#[cfg(not(target_os = "android"))]
fn read_secret(account: &str) -> Result<Option<String>, String> {
    match secret_entry(account)?.get_password() {
        Ok(secret) => Ok(Some(secret)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(error) => Err(format!("No se pudo leer el almacén seguro: {error}")),
    }
}

#[cfg(not(target_os = "android"))]
fn write_secret(account: &str, secret: &str) -> Result<(), String> {
    secret_entry(account)?
        .set_password(secret)
        .map_err(|error| format!("No se pudo escribir en el almacén seguro: {error}"))
}

#[cfg(target_os = "android")]
fn android_secret_entry(account: &str) -> Result<keyring_core::Entry, String> {
    use keyring_core::api::CredentialStoreApi;

    let store = android_native_keyring_store::Store::new()
        .map_err(|error| format!("Android Keystore no está disponible: {error}"))?;
    store
        .build(KEYRING_SERVICE, account, None)
        .map_err(|error| format!("No se pudo abrir la entrada de Android Keystore: {error}"))
}

#[cfg(target_os = "android")]
fn read_secret(account: &str) -> Result<Option<String>, String> {
    match android_secret_entry(account)?.get_password() {
        Ok(secret) => Ok(Some(secret)),
        Err(keyring_core::Error::NoEntry) => Ok(None),
        Err(error) => Err(format!("No se pudo leer Android Keystore: {error}")),
    }
}

#[cfg(target_os = "android")]
fn write_secret(account: &str, secret: &str) -> Result<(), String> {
    android_secret_entry(account)?
        .set_password(secret)
        .map_err(|error| format!("No se pudo escribir en Android Keystore: {error}"))
}

fn database_key(create: bool) -> Result<String, String> {
    match read_secret(DATABASE_KEY_ACCOUNT)? {
        Some(key) if !key.is_empty() => Ok(key),
        Some(_) => Err("El almacén seguro devolvió una clave vacía.".into()),
        None if create => {
            let mut bytes = [0_u8; 32];
            getrandom::fill(&mut bytes)
                .map_err(|error| format!("No se pudo generar material criptográfico: {error}"))?;
            let key = URL_SAFE_NO_PAD.encode(bytes);
            write_secret(DATABASE_KEY_ACCOUNT, &key)?;
            Ok(key)
        }
        None => Err("No existe una clave local en el almacén seguro.".into()),
    }
}

fn database_path(app: &AppHandle) -> Result<PathBuf, String> {
    let directory = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("No se pudo resolver el directorio privado: {error}"))?;
    fs::create_dir_all(&directory)
        .map_err(|error| format!("No se pudo crear el directorio privado: {error}"))?;
    Ok(directory.join("2free-local.db"))
}

fn open_encrypted(path: &Path, key: &str) -> Result<(Connection, String), String> {
    let connection = Connection::open(path)
        .map_err(|error| format!("No se pudo abrir la base local: {error}"))?;
    connection
        .pragma_update(None, "key", key)
        .map_err(|error| format!("SQLCipher rechazó la clave: {error}"))?;
    let cipher_version = connection
        .query_row("PRAGMA cipher_version", [], |row| row.get::<_, String>(0))
        .optional()
        .map_err(|error| format!("No se pudo verificar SQLCipher: {error}"))?
        .filter(|version| !version.trim().is_empty())
        .ok_or_else(|| {
            "SQLCipher no está presente; se rechazó la persistencia de texto plano.".to_string()
        })?;
    connection
        .query_row("SELECT count(*) FROM sqlite_master", [], |row| {
            row.get::<_, i64>(0)
        })
        .map_err(|error| format!("La clave no puede abrir la base cifrada: {error}"))?;
    connection
        .execute_batch("PRAGMA foreign_keys = ON; PRAGMA secure_delete = ON;")
        .map_err(|error| format!("No se pudieron activar las garantías SQLite: {error}"))?;
    let foreign_keys: i64 = connection
        .query_row("PRAGMA foreign_keys", [], |row| row.get(0))
        .map_err(|error| format!("No se pudo verificar foreign_keys: {error}"))?;
    if foreign_keys != 1 {
        return Err("SQLite no activó las claves foráneas; la base local se cerró.".into());
    }
    migrate(&connection)?;
    Ok((connection, cipher_version))
}

fn migrate(connection: &Connection) -> Result<(), String> {
    connection
        .execute_batch(
            "BEGIN IMMEDIATE;
             CREATE TABLE IF NOT EXISTS accounts (
               id TEXT PRIMARY KEY, type TEXT NOT NULL, label TEXT NOT NULL, currency TEXT NOT NULL,
               metadata_json TEXT NOT NULL, statement_coefficient TEXT, statement_scale INTEGER,
               created_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS transactions (
               id TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
               coefficient TEXT NOT NULL, scale INTEGER NOT NULL, currency TEXT NOT NULL,
               metadata_json TEXT NOT NULL, created_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS products (
               id TEXT PRIMARY KEY, kind TEXT NOT NULL, value_json TEXT NOT NULL,
               created_at TEXT NOT NULL, updated_at TEXT NOT NULL
             );
             CREATE INDEX IF NOT EXISTS products_kind_idx ON products(kind);
              CREATE TABLE IF NOT EXISTS notification_deliveries (
               event_id TEXT PRIMARY KEY, rule_id TEXT NOT NULL, occurred_at TEXT NOT NULL,
               delivered_at TEXT NOT NULL
              );
              CREATE TABLE IF NOT EXISTS sync_outbox (
                operation_id TEXT PRIMARY KEY, entity_kind TEXT NOT NULL, entity_id TEXT NOT NULL,
                operation TEXT NOT NULL, version INTEGER NOT NULL, occurred_at TEXT NOT NULL,
                payload_json TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
                next_attempt_at TEXT, last_error TEXT, acknowledged_at TEXT
              );
              CREATE INDEX IF NOT EXISTS sync_outbox_pending_idx
                ON sync_outbox(acknowledged_at, next_attempt_at, occurred_at);
              CREATE TABLE IF NOT EXISTS sync_mappings (
                entity_kind TEXT NOT NULL, local_id TEXT NOT NULL, remote_id TEXT NOT NULL,
                updated_at TEXT NOT NULL, PRIMARY KEY(entity_kind, local_id),
                UNIQUE(entity_kind,remote_id)
              );
              PRAGMA user_version = 2;
             COMMIT;",
        )
        .map_err(|error| format!("Falló la migración cifrada: {error}"))
}

fn with_database<T>(
    app: &AppHandle,
    operation: impl FnOnce(&Connection) -> Result<T, String>,
) -> Result<T, String> {
    let path = database_path(app)?;
    let key = database_key(true)?;
    let (connection, _) = open_encrypted(&path, &key)?;
    operation(&connection)
}

fn now() -> String {
    OffsetDateTime::now_utc()
        .format(&Rfc3339)
        .unwrap_or_else(|_| "1970-01-01T00:00:00Z".into())
}

fn random_id(prefix: &str) -> Result<String, String> {
    let mut bytes = [0_u8; 16];
    getrandom::fill(&mut bytes)
        .map_err(|error| format!("No se pudo generar un identificador seguro: {error}"))?;
    Ok(format!("{prefix}-{}", hex::encode(bytes)))
}

fn version_now() -> i64 {
    (OffsetDateTime::now_utc().unix_timestamp_nanos() / 1_000_000)
        .try_into()
        .unwrap_or(i64::MAX)
}

fn enqueue_change(
    transaction: &Transaction<'_>,
    entity_kind: &str,
    entity_id: &str,
    operation: &str,
    payload: &Value,
) -> Result<String, String> {
    let operation_id = random_id("sync")?;
    transaction.execute(
        "INSERT INTO sync_outbox(operation_id,entity_kind,entity_id,operation,version,occurred_at,payload_json) VALUES (?1,?2,?3,?4,?5,?6,?7)",
        params![operation_id, entity_kind, entity_id, operation, version_now(), now(), serde_json::to_string(payload).map_err(|error| error.to_string())?],
    ).map_err(|error| format!("No se pudo registrar el cambio local: {error}"))?;
    Ok(operation_id)
}

fn row_json(row: &rusqlite::Row<'_>, kind: &str) -> rusqlite::Result<Value> {
    let metadata: String = row.get("metadata_json")?;
    let mut value = json!({
        "id": row.get::<_, String>("id")?,
        "createdAt": row.get::<_, String>("created_at")?,
        "metadata": serde_json::from_str::<Value>(&metadata).unwrap_or_else(|_| json!({}))
    });
    if kind == "account" {
        value["type"] = json!(row.get::<_, String>("type")?);
        value["label"] = json!(row.get::<_, String>("label")?);
        value["currency"] = json!(row.get::<_, String>("currency")?);
        if let Some(coefficient) = row.get::<_, Option<String>>("statement_coefficient")? {
            value["statementBalance"] = json!({
                "currency": value["currency"],
                "coefficient": coefficient,
                "scale": row.get::<_, Option<i64>>("statement_scale")?.unwrap_or(0)
            });
        }
    } else {
        value["accountId"] = json!(row.get::<_, String>("account_id")?);
        value["amount"] = json!({
            "currency": row.get::<_, String>("currency")?,
            "coefficient": row.get::<_, String>("coefficient")?,
            "scale": row.get::<_, i64>("scale")?
        });
    }
    Ok(value)
}

fn list_accounts(connection: &Connection) -> Result<Vec<Value>, String> {
    let mut statement = connection
        .prepare("SELECT * FROM accounts ORDER BY created_at, id")
        .map_err(|error| error.to_string())?;
    let result = statement
        .query_map([], |row| row_json(row, "account"))
        .map_err(|error| error.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string());
    result
}

fn list_transactions(connection: &Connection) -> Result<Vec<Value>, String> {
    let mut statement = connection
        .prepare("SELECT * FROM transactions ORDER BY created_at DESC, id")
        .map_err(|error| error.to_string())?;
    let result = statement
        .query_map([], |row| row_json(row, "transaction"))
        .map_err(|error| error.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string());
    result
}

fn validate_account_input(input: &Value) -> Result<Value, String> {
    let account_type = input.get("type").and_then(Value::as_str).unwrap_or("debit");
    let label = input
        .get("label")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| "La cuenta requiere un nombre.".to_string())?;
    let currency = input
        .get("currency")
        .and_then(Value::as_str)
        .unwrap_or("MXN")
        .to_uppercase();
    let mut result = json!({
        "type": account_type,
        "label": label,
        "currency": currency,
        "metadata": input.get("metadata").cloned().unwrap_or_else(|| json!({}))
    });
    if let Some(statement_balance) = input.get("statementBalance") {
        result["statementBalance"] = statement_balance.clone();
    }
    Ok(result)
}

fn validate_transaction_input(input: &Value) -> Result<Value, String> {
    let account_id = input
        .get("accountId")
        .and_then(Value::as_str)
        .ok_or_else(|| "La transacción requiere una cuenta.".to_string())?;
    let amount = input
        .get("amount")
        .ok_or_else(|| "La transacción requiere un monto exacto.".to_string())?;
    amount
        .get("coefficient")
        .and_then(Value::as_str)
        .filter(|value| value.parse::<i128>().is_ok())
        .ok_or_else(|| "El coeficiente monetario no es válido.".to_string())?;
    amount
        .get("scale")
        .and_then(Value::as_i64)
        .filter(|value| *value >= 0)
        .ok_or_else(|| "La escala monetaria no es válida.".to_string())?;
    amount
        .get("currency")
        .and_then(Value::as_str)
        .ok_or_else(|| "Falta la moneda.".to_string())?;
    Ok(json!({
        "accountId": account_id,
        "amount": amount,
        "metadata": input.get("metadata").cloned().unwrap_or_else(|| json!({}))
    }))
}

fn create_account_record(connection: &Connection, input: Value) -> Result<Value, String> {
    let id = input
        .get("id")
        .and_then(Value::as_str)
        .map(str::to_owned)
        .map(Ok)
        .unwrap_or_else(|| random_id("account"))?;
    let created_at = input
        .get("createdAt")
        .and_then(Value::as_str)
        .map(str::to_owned)
        .unwrap_or_else(now);
    let mut result = validate_account_input(&input)?;
    result["id"] = json!(id);
    result["createdAt"] = json!(created_at);
    let statement = result.get("statementBalance");
    let transaction = connection
        .unchecked_transaction()
        .map_err(|error| error.to_string())?;
    transaction.execute(
        "INSERT INTO accounts (id,type,label,currency,metadata_json,statement_coefficient,statement_scale,created_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
        params![id, result["type"].as_str(), result["label"].as_str(), result["currency"].as_str(),
            serde_json::to_string(&result["metadata"]).map_err(|error| error.to_string())?,
            statement.and_then(|value| value.get("coefficient")).and_then(Value::as_str),
            statement.and_then(|value| value.get("scale")).and_then(Value::as_i64), created_at],
    ).map_err(|error| format!("No se pudo crear la cuenta: {error}"))?;
    enqueue_change(&transaction, "account", &id, "create", &result)?;
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(result)
}

fn update_account_record(connection: &Connection, id: &str, input: Value) -> Result<Value, String> {
    let mut result = validate_account_input(&input)?;
    let transaction = connection
        .unchecked_transaction()
        .map_err(|error| error.to_string())?;
    let created_at: String = transaction
        .query_row(
            "SELECT created_at FROM accounts WHERE id = ?1",
            [id],
            |row| row.get(0),
        )
        .map_err(|_| "No existe la cuenta local.".to_string())?;
    result["id"] = json!(id);
    result["createdAt"] = json!(created_at);
    let statement = result.get("statementBalance");
    transaction.execute(
        "UPDATE accounts SET type=?1,label=?2,currency=?3,metadata_json=?4,statement_coefficient=?5,statement_scale=?6 WHERE id=?7",
        params![result["type"].as_str(), result["label"].as_str(), result["currency"].as_str(),
            serde_json::to_string(&result["metadata"]).map_err(|error| error.to_string())?,
            statement.and_then(|value| value.get("coefficient")).and_then(Value::as_str),
            statement.and_then(|value| value.get("scale")).and_then(Value::as_i64), id],
    ).map_err(|error| format!("No se pudo actualizar la cuenta: {error}"))?;
    enqueue_change(&transaction, "account", id, "update", &result)?;
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(result)
}

fn delete_account_record(connection: &Connection, id: &str) -> Result<(), String> {
    let transaction = connection
        .unchecked_transaction()
        .map_err(|error| error.to_string())?;
    let has_transactions: bool = transaction
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM transactions WHERE account_id = ?1)",
            [id],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())?;
    if has_transactions {
        return Err("No se puede eliminar una cuenta con transacciones asociadas.".into());
    }
    let deleted = transaction
        .execute("DELETE FROM accounts WHERE id = ?1", [id])
        .map_err(|error| format!("No se pudo eliminar la cuenta: {error}"))?;
    if deleted == 0 {
        return Err("No existe la cuenta local.".into());
    }
    enqueue_change(&transaction, "account", id, "delete", &Value::Null)?;
    transaction.commit().map_err(|error| error.to_string())
}

fn create_transaction_record(connection: &Connection, input: Value) -> Result<Value, String> {
    let id = input
        .get("id")
        .and_then(Value::as_str)
        .map(str::to_owned)
        .map(Ok)
        .unwrap_or_else(|| random_id("transaction"))?;
    let created_at = input
        .get("createdAt")
        .and_then(Value::as_str)
        .map(str::to_owned)
        .unwrap_or_else(now);
    let mut result = validate_transaction_input(&input)?;
    result["id"] = json!(id);
    result["createdAt"] = json!(created_at);
    let amount = &result["amount"];
    let transaction = connection
        .unchecked_transaction()
        .map_err(|error| error.to_string())?;
    transaction.execute(
        "INSERT INTO transactions (id,account_id,coefficient,scale,currency,metadata_json,created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)",
        params![id, result["accountId"].as_str(), amount["coefficient"].as_str(), amount["scale"].as_i64(), amount["currency"].as_str(),
            serde_json::to_string(&result["metadata"]).map_err(|error| error.to_string())?, created_at],
    ).map_err(|error| format!("No se pudo crear la transacción: {error}"))?;
    enqueue_change(&transaction, "transaction", &id, "create", &result)?;
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(result)
}

fn update_transaction_record(
    connection: &Connection,
    id: &str,
    input: Value,
) -> Result<Value, String> {
    let mut result = validate_transaction_input(&input)?;
    let transaction = connection
        .unchecked_transaction()
        .map_err(|error| error.to_string())?;
    let created_at: String = transaction
        .query_row(
            "SELECT created_at FROM transactions WHERE id = ?1",
            [id],
            |row| row.get(0),
        )
        .map_err(|_| "No existe la transacción local.".to_string())?;
    result["id"] = json!(id);
    result["createdAt"] = json!(created_at);
    let amount = &result["amount"];
    transaction.execute(
        "UPDATE transactions SET account_id=?1,coefficient=?2,scale=?3,currency=?4,metadata_json=?5 WHERE id=?6",
        params![result["accountId"].as_str(), amount["coefficient"].as_str(), amount["scale"].as_i64(), amount["currency"].as_str(),
            serde_json::to_string(&result["metadata"]).map_err(|error| error.to_string())?, id],
    ).map_err(|error| format!("No se pudo actualizar la transacción: {error}"))?;
    enqueue_change(&transaction, "transaction", id, "update", &result)?;
    transaction.commit().map_err(|error| error.to_string())?;
    Ok(result)
}

fn delete_transaction_record(connection: &Connection, id: &str) -> Result<(), String> {
    let transaction = connection
        .unchecked_transaction()
        .map_err(|error| error.to_string())?;
    let deleted = transaction
        .execute("DELETE FROM transactions WHERE id = ?1", [id])
        .map_err(|error| format!("No se pudo eliminar la transacción: {error}"))?;
    if deleted == 0 {
        return Err("No existe la transacción local.".into());
    }
    enqueue_change(&transaction, "transaction", id, "delete", &Value::Null)?;
    transaction.commit().map_err(|error| error.to_string())
}

fn list_products(
    connection: &Connection,
    kind: Option<&str>,
) -> Result<Vec<ProductRecord>, String> {
    let sql = if kind.is_some() {
        "SELECT id, kind, value_json, created_at, updated_at FROM products WHERE kind = ?1 ORDER BY created_at DESC"
    } else {
        "SELECT id, kind, value_json, created_at, updated_at FROM products ORDER BY kind, created_at DESC"
    };
    let mut statement = connection.prepare(sql).map_err(|error| error.to_string())?;
    let map = |row: &rusqlite::Row<'_>| -> rusqlite::Result<ProductRecord> {
        let encoded: String = row.get(2)?;
        Ok(ProductRecord {
            id: row.get(0)?,
            kind: row.get(1)?,
            value: serde_json::from_str(&encoded).unwrap_or(Value::Null),
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
        })
    };
    if let Some(kind) = kind {
        statement
            .query_map([kind], map)
            .map_err(|error| error.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|error| error.to_string())
    } else {
        statement
            .query_map([], map)
            .map_err(|error| error.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|error| error.to_string())
    }
}

#[tauri::command]
fn local_initialize(app: AppHandle) -> Result<CapabilityReport, String> {
    let path = database_path(&app)?;
    let key = database_key(true)?;
    let (_, cipher_version) = open_encrypted(&path, &key)?;
    Ok(CapabilityReport {
        database: "sqlcipher-verified",
        key_storage: "os-secure-store",
        cipher_version,
        database_path: path.to_string_lossy().into_owned(),
    })
}

#[tauri::command]
fn load_runtime_configuration() -> Result<Option<RuntimeConfiguration>, String> {
    match read_secret(RUNTIME_CONFIG_ACCOUNT)? {
        Some(encoded) => serde_json::from_str(&encoded)
            .map(Some)
            .map_err(|error| format!("La configuración segura está dañada: {error}")),
        None => Ok(None),
    }
}

#[tauri::command]
fn save_runtime_configuration(configuration: RuntimeConfiguration) -> Result<(), String> {
    if !matches!(configuration.mode.as_str(), "local" | "cloud" | "self-host") {
        return Err("El modo de datos no es válido.".into());
    }
    let encoded = serde_json::to_string(&configuration).map_err(|error| error.to_string())?;
    write_secret(RUNTIME_CONFIG_ACCOUNT, &encoded)
}

#[tauri::command]
fn local_list_accounts(app: AppHandle) -> Result<Vec<Value>, String> {
    with_database(&app, list_accounts)
}

#[tauri::command]
fn local_create_account(app: AppHandle, input: Value) -> Result<Value, String> {
    with_database(&app, |connection| create_account_record(connection, input))
}

#[tauri::command]
fn local_update_account(app: AppHandle, id: String, input: Value) -> Result<Value, String> {
    with_database(&app, |connection| {
        update_account_record(connection, &id, input)
    })
}

#[tauri::command]
fn local_delete_account(app: AppHandle, id: String) -> Result<(), String> {
    with_database(&app, |connection| delete_account_record(connection, &id))
}

#[tauri::command]
fn local_list_transactions(app: AppHandle) -> Result<Vec<Value>, String> {
    with_database(&app, list_transactions)
}

#[tauri::command]
fn local_create_transaction(app: AppHandle, input: Value) -> Result<Value, String> {
    with_database(&app, |connection| {
        create_transaction_record(connection, input)
    })
}

#[tauri::command]
fn local_update_transaction(app: AppHandle, id: String, input: Value) -> Result<Value, String> {
    with_database(&app, |connection| {
        update_transaction_record(connection, &id, input)
    })
}

#[tauri::command]
fn local_delete_transaction(app: AppHandle, id: String) -> Result<(), String> {
    with_database(&app, |connection| {
        delete_transaction_record(connection, &id)
    })
}

#[tauri::command]
fn local_list_products(app: AppHandle, kind: String) -> Result<Vec<ProductRecord>, String> {
    with_database(&app, |connection| list_products(connection, Some(&kind)))
}

#[tauri::command]
fn local_create_product(
    app: AppHandle,
    kind: String,
    input: Value,
) -> Result<ProductRecord, String> {
    with_database(&app, |connection| {
        let transaction = connection
            .unchecked_transaction()
            .map_err(|error| error.to_string())?;
        let timestamp = now();
        let id = input
            .get("id")
            .and_then(Value::as_str)
            .map(str::to_owned)
            .map(Ok)
            .unwrap_or_else(|| random_id(&kind))?;
        let encoded = serde_json::to_string(&input).map_err(|error| error.to_string())?;
        transaction.execute("INSERT INTO products (id,kind,value_json,created_at,updated_at) VALUES (?1,?2,?3,?4,?4)", params![id, kind, encoded, timestamp])
            .map_err(|error| format!("No se pudo guardar el producto: {error}"))?;
        let record = ProductRecord {
            id,
            kind,
            value: input,
            created_at: timestamp.clone(),
            updated_at: timestamp,
        };
        enqueue_change(
            &transaction,
            &format!("product:{}", record.kind),
            &record.id,
            "create",
            &record.value,
        )?;
        transaction.commit().map_err(|error| error.to_string())?;
        Ok(record)
    })
}

#[tauri::command]
fn local_update_product(
    app: AppHandle,
    kind: String,
    id: String,
    input: Value,
) -> Result<ProductRecord, String> {
    with_database(&app, |connection| {
        let transaction = connection
            .unchecked_transaction()
            .map_err(|error| error.to_string())?;
        let created_at: String = transaction
            .query_row(
                "SELECT created_at FROM products WHERE id = ?1 AND kind = ?2",
                params![id, kind],
                |row| row.get(0),
            )
            .map_err(|_| "No existe el producto local.".to_string())?;
        let updated_at = now();
        transaction
            .execute(
                "UPDATE products SET value_json = ?1, updated_at = ?2 WHERE id = ?3 AND kind = ?4",
                params![
                    serde_json::to_string(&input).map_err(|error| error.to_string())?,
                    updated_at,
                    id,
                    kind
                ],
            )
            .map_err(|error| format!("No se pudo actualizar el producto: {error}"))?;
        enqueue_change(
            &transaction,
            &format!("product:{kind}"),
            &id,
            "update",
            &input,
        )?;
        transaction.commit().map_err(|error| error.to_string())?;
        Ok(ProductRecord {
            id,
            kind,
            value: input,
            created_at,
            updated_at,
        })
    })
}

#[tauri::command]
fn local_delete_product(app: AppHandle, kind: String, id: String) -> Result<(), String> {
    with_database(&app, |connection| {
        let transaction = connection
            .unchecked_transaction()
            .map_err(|error| error.to_string())?;
        transaction
            .execute(
                "DELETE FROM products WHERE id = ?1 AND kind = ?2",
                params![id, kind],
            )
            .map_err(|error| error.to_string())?;
        enqueue_change(
            &transaction,
            &format!("product:{kind}"),
            &id,
            "delete",
            &Value::Null,
        )?;
        transaction.commit().map_err(|error| error.to_string())?;
        Ok(())
    })
}

#[tauri::command]
fn local_add_shared_member(
    app: AppHandle,
    group_id: String,
    user_id: String,
) -> Result<(), String> {
    with_database(&app, |connection| {
        let transaction = connection
            .unchecked_transaction()
            .map_err(|error| error.to_string())?;
        let encoded: String = transaction
            .query_row(
                "SELECT value_json FROM products WHERE id = ?1 AND kind = 'shared-group'",
                [&group_id],
                |row| row.get(0),
            )
            .map_err(|_| "No existe el grupo compartido.".to_string())?;
        let mut value: Value = serde_json::from_str(&encoded).map_err(|error| error.to_string())?;
        let members = value
            .as_object_mut()
            .ok_or_else(|| "El grupo no es válido.".to_string())?
            .entry("members")
            .or_insert_with(|| json!([]))
            .as_array_mut()
            .ok_or_else(|| "Los integrantes no son válidos.".to_string())?;
        if !members
            .iter()
            .any(|member| member.get("userId").and_then(Value::as_str) == Some(&user_id))
        {
            members.push(json!({ "userId": user_id, "role": "member" }));
        }
        transaction
            .execute(
                "UPDATE products SET value_json = ?1, updated_at = ?2 WHERE id = ?3",
                params![
                    serde_json::to_string(&value).map_err(|error| error.to_string())?,
                    now(),
                    group_id
                ],
            )
            .map_err(|error| error.to_string())?;
        enqueue_change(
            &transaction,
            "product:shared-group",
            &group_id,
            "update",
            &value,
        )?;
        transaction.commit().map_err(|error| error.to_string())?;
        Ok(())
    })
}

fn portable_export(connection: &Connection) -> Result<PortableEnvelope, String> {
    Ok(PortableEnvelope {
        format: "2free-portable".into(),
        version: 2,
        exported_at: now(),
        accounts: list_accounts(connection)?,
        transactions: list_transactions(connection)?,
        records: list_products(connection, None)?,
    })
}

#[tauri::command]
fn local_export_portable(app: AppHandle) -> Result<PortableEnvelope, String> {
    with_database(&app, portable_export)
}

#[tauri::command]
fn local_create_sync_backup(app: AppHandle) -> Result<String, String> {
    let source = database_path(&app)?;
    let backup = source.with_extension(format!("sync-backup-{}.db", version_now()));
    fs::copy(&source, &backup)
        .map_err(|error| format!("No se pudo crear el respaldo previo a sincronizar: {error}"))?;
    Ok(backup.to_string_lossy().into_owned())
}

#[tauri::command]
fn local_pending_changes(app: AppHandle) -> Result<Vec<PendingChange>, String> {
    with_database(&app, |connection| {
        let mut statement = connection.prepare(
            "SELECT operation_id,entity_kind,entity_id,operation,version,occurred_at,payload_json,attempts
             FROM sync_outbox WHERE acknowledged_at IS NULL AND (next_attempt_at IS NULL OR next_attempt_at <= ?1)
             ORDER BY occurred_at,operation_id",
        ).map_err(|error| error.to_string())?;
        let changes = statement
            .query_map([now()], |row| {
                let encoded: String = row.get(6)?;
                Ok(PendingChange {
                    operation_id: row.get(0)?,
                    entity_kind: row.get(1)?,
                    entity_id: row.get(2)?,
                    operation: row.get(3)?,
                    version: row.get(4)?,
                    occurred_at: row.get(5)?,
                    payload: serde_json::from_str(&encoded).unwrap_or(Value::Null),
                    attempts: row.get(7)?,
                })
            })
            .map_err(|error| error.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|error| error.to_string())?;
        Ok(changes)
    })
}

#[tauri::command]
fn local_sync_pending_count(app: AppHandle) -> Result<i64, String> {
    with_database(&app, |connection| {
        connection
            .query_row(
                "SELECT count(*) FROM sync_outbox WHERE acknowledged_at IS NULL",
                [],
                |row| row.get(0),
            )
            .map_err(|error| error.to_string())
    })
}

#[tauri::command]
fn local_acknowledge_change(app: AppHandle, operation_id: String) -> Result<(), String> {
    with_database(&app, |connection| {
        connection.execute(
            "UPDATE sync_outbox SET acknowledged_at=COALESCE(acknowledged_at,?1),last_error=NULL WHERE operation_id=?2",
            params![now(), operation_id],
        ).map_err(|error| error.to_string())?;
        Ok(())
    })
}

#[tauri::command]
fn local_fail_change(app: AppHandle, operation_id: String, message: String) -> Result<(), String> {
    with_database(&app, |connection| {
        let attempts: i64 = connection
            .query_row(
                "SELECT attempts FROM sync_outbox WHERE operation_id=?1",
                [&operation_id],
                |row| row.get(0),
            )
            .map_err(|error| error.to_string())?;
        let delay = 2_i64.pow((attempts + 1).min(8) as u32).min(300);
        let retry_at = (OffsetDateTime::now_utc() + Duration::seconds(delay))
            .format(&Rfc3339)
            .map_err(|error| error.to_string())?;
        connection.execute(
            "UPDATE sync_outbox SET attempts=attempts+1,next_attempt_at=?1,last_error=?2 WHERE operation_id=?3 AND acknowledged_at IS NULL",
            params![retry_at, message, operation_id],
        ).map_err(|error| error.to_string())?;
        Ok(())
    })
}

#[tauri::command]
fn local_set_sync_mapping(
    app: AppHandle,
    entity_kind: String,
    local_id: String,
    remote_id: String,
) -> Result<(), String> {
    with_database(&app, |connection| {
        connection.execute(
            "INSERT INTO sync_mappings(entity_kind,local_id,remote_id,updated_at) VALUES (?1,?2,?3,?4)
             ON CONFLICT(entity_kind,local_id) DO UPDATE SET remote_id=excluded.remote_id,updated_at=excluded.updated_at",
            params![entity_kind, local_id, remote_id, now()],
        ).map_err(|error| error.to_string())?;
        Ok(())
    })
}

#[tauri::command]
fn local_get_remote_id(
    app: AppHandle,
    entity_kind: String,
    local_id: String,
) -> Result<Option<String>, String> {
    with_database(&app, |connection| {
        connection
            .query_row(
                "SELECT remote_id FROM sync_mappings WHERE entity_kind=?1 AND local_id=?2",
                params![entity_kind, local_id],
                |row| row.get(0),
            )
            .optional()
            .map_err(|error| error.to_string())
    })
}

fn mapped_local_id(
    connection: &Connection,
    kind: &str,
    remote_id: &str,
) -> Result<Option<String>, String> {
    connection
        .query_row(
            "SELECT local_id FROM sync_mappings WHERE entity_kind=?1 AND remote_id=?2",
            params![kind, remote_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn local_merge_remote(app: AppHandle, envelope: PortableEnvelope) -> Result<(), String> {
    if envelope.format != "2free-portable" || envelope.version != 2 {
        return Err("La réplica remota no usa el formato portable v2.".into());
    }
    with_database(&app, |connection| {
        let transaction = connection
            .unchecked_transaction()
            .map_err(|error| error.to_string())?;
        for account in &envelope.accounts {
            let remote_id = account
                .get("id")
                .and_then(Value::as_str)
                .ok_or_else(|| "Cuenta remota sin identificador.".to_string())?;
            if mapped_local_id(&transaction, "account", remote_id)?.is_none() {
                transaction.execute(
                    "INSERT OR IGNORE INTO sync_mappings(entity_kind,local_id,remote_id,updated_at) VALUES ('account',?1,?1,?2)",
                    params![remote_id, now()],
                ).map_err(|error| error.to_string())?;
                if let Err(error) = import_account(&transaction, account) {
                    if !error.contains("UNIQUE") {
                        return Err(error);
                    }
                }
            }
        }
        for item in &envelope.transactions {
            let remote_id = item
                .get("id")
                .and_then(Value::as_str)
                .ok_or_else(|| "Transacción remota sin identificador.".to_string())?;
            if mapped_local_id(&transaction, "transaction", remote_id)?.is_none() {
                let mut local_item = item.clone();
                if let Some(remote_account) = item.get("accountId").and_then(Value::as_str) {
                    if let Some(local_account) =
                        mapped_local_id(&transaction, "account", remote_account)?
                    {
                        local_item["accountId"] = json!(local_account);
                    }
                }
                transaction.execute(
                    "INSERT OR IGNORE INTO sync_mappings(entity_kind,local_id,remote_id,updated_at) VALUES ('transaction',?1,?1,?2)",
                    params![remote_id, now()],
                ).map_err(|error| error.to_string())?;
                if let Err(error) = import_transaction(&transaction, &local_item) {
                    if !error.contains("UNIQUE") {
                        return Err(error);
                    }
                }
            }
        }
        for record in &envelope.records {
            let entity_kind = format!("product:{}", record.kind);
            let local_id = mapped_local_id(&transaction, &entity_kind, &record.id)?
                .unwrap_or_else(|| record.id.clone());
            let has_pending: bool = transaction.query_row(
                "SELECT EXISTS(SELECT 1 FROM sync_outbox WHERE acknowledged_at IS NULL AND entity_kind=?1 AND entity_id=?2)",
                params![entity_kind, local_id], |row| row.get(0),
            ).map_err(|error| error.to_string())?;
            let local_updated: Option<String> = transaction
                .query_row(
                    "SELECT updated_at FROM products WHERE id=?1 AND kind=?2",
                    params![local_id, record.kind],
                    |row| row.get(0),
                )
                .optional()
                .map_err(|error| error.to_string())?;
            let remote_is_newer = local_updated
                .as_deref()
                .map(|value| value < record.updated_at.as_str())
                .unwrap_or(true);
            if !has_pending && remote_is_newer {
                transaction.execute(
                    "INSERT INTO products(id,kind,value_json,created_at,updated_at) VALUES (?1,?2,?3,?4,?5)
                     ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,value_json=excluded.value_json,updated_at=excluded.updated_at",
                    params![local_id, record.kind, serde_json::to_string(&record.value).map_err(|error| error.to_string())?, record.created_at, record.updated_at],
                ).map_err(|error| error.to_string())?;
            }
            transaction.execute(
                "INSERT OR IGNORE INTO sync_mappings(entity_kind,local_id,remote_id,updated_at) VALUES (?1,?2,?3,?4)",
                params![entity_kind, local_id, record.id, now()],
            ).map_err(|error| error.to_string())?;
        }
        transaction.commit().map_err(|error| error.to_string())
    })
}

fn import_account(transaction: &Transaction<'_>, account: &Value) -> Result<(), String> {
    let statement = account.get("statementBalance");
    transaction.execute(
        "INSERT INTO accounts (id,type,label,currency,metadata_json,statement_coefficient,statement_scale,created_at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
        params![account.get("id").and_then(Value::as_str), account.get("type").and_then(Value::as_str),
            account.get("label").and_then(Value::as_str), account.get("currency").and_then(Value::as_str),
            serde_json::to_string(account.get("metadata").unwrap_or(&json!({}))).map_err(|error| error.to_string())?,
            statement.and_then(|value| value.get("coefficient")).and_then(Value::as_str), statement.and_then(|value| value.get("scale")).and_then(Value::as_i64),
            account.get("createdAt").and_then(Value::as_str)],
    ).map_err(|error| format!("Cuenta portable no válida: {error}"))?;
    Ok(())
}

fn import_transaction(transaction: &Transaction<'_>, item: &Value) -> Result<(), String> {
    let amount = item
        .get("amount")
        .ok_or_else(|| "La transacción portable no tiene monto.".to_string())?;
    transaction.execute(
        "INSERT INTO transactions (id,account_id,coefficient,scale,currency,metadata_json,created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)",
        params![item.get("id").and_then(Value::as_str), item.get("accountId").and_then(Value::as_str), amount.get("coefficient").and_then(Value::as_str),
            amount.get("scale").and_then(Value::as_i64), amount.get("currency").and_then(Value::as_str),
            serde_json::to_string(item.get("metadata").unwrap_or(&json!({}))).map_err(|error| error.to_string())?, item.get("createdAt").and_then(Value::as_str)],
    ).map_err(|error| format!("Transacción portable no válida: {error}"))?;
    Ok(())
}

#[tauri::command]
fn local_import_portable(app: AppHandle, envelope: PortableEnvelope) -> Result<(), String> {
    if envelope.format != "2free-portable" || envelope.version != 2 {
        return Err("El respaldo no es un sobre portable 2 Free v2.".into());
    }
    with_database(&app, |connection| {
        let transaction = connection
            .unchecked_transaction()
            .map_err(|error| error.to_string())?;
        transaction
            .execute_batch("DELETE FROM transactions; DELETE FROM accounts; DELETE FROM products;")
            .map_err(|error| error.to_string())?;
        for account in &envelope.accounts {
            import_account(&transaction, account)?;
        }
        for item in &envelope.transactions {
            import_transaction(&transaction, item)?;
        }
        for record in &envelope.records {
            transaction.execute("INSERT INTO products (id,kind,value_json,created_at,updated_at) VALUES (?1,?2,?3,?4,?5)",
                params![record.id, record.kind, serde_json::to_string(&record.value).map_err(|error| error.to_string())?, record.created_at, record.updated_at])
                .map_err(|error| format!("Producto portable no válido: {error}"))?;
        }
        transaction
            .commit()
            .map_err(|error| format!("No se pudo confirmar la importación: {error}"))
    })
}

fn parse_decimal(value: &str) -> Result<(bool, String, usize), String> {
    let trimmed = value.trim();
    let negative = trimmed.starts_with('-');
    let unsigned = if negative { &trimmed[1..] } else { trimmed };
    let mut parts = unsigned.split('.');
    let whole = parts.next().unwrap_or("0");
    let fraction = parts.next().unwrap_or("");
    if parts.next().is_some()
        || whole.is_empty()
        || !whole.chars().all(|c| c.is_ascii_digit())
        || !fraction.chars().all(|c| c.is_ascii_digit())
    {
        return Err("Una regla contiene un decimal no válido.".into());
    }
    let digits = format!("{whole}{fraction}")
        .trim_start_matches('0')
        .to_string();
    Ok((
        negative,
        if digits.is_empty() {
            "0".into()
        } else {
            digits
        },
        fraction.len(),
    ))
}

fn decimal_cmp(left: &str, right: &str) -> Result<Ordering, String> {
    let (left_negative, mut left_digits, left_scale) = parse_decimal(left)?;
    let (right_negative, mut right_digits, right_scale) = parse_decimal(right)?;
    let scale = left_scale.max(right_scale);
    left_digits.push_str(&"0".repeat(scale - left_scale));
    right_digits.push_str(&"0".repeat(scale - right_scale));
    let magnitude = left_digits
        .len()
        .cmp(&right_digits.len())
        .then_with(|| left_digits.cmp(&right_digits));
    Ok(match (left_negative, right_negative) {
        (true, false) => Ordering::Less,
        (false, true) => Ordering::Greater,
        (true, true) => magnitude.reverse(),
        (false, false) => magnitude,
    })
}

fn matches_rule(comparator: &str, ordering: Ordering) -> bool {
    match comparator {
        "gt" => ordering == Ordering::Greater,
        "gte" => ordering != Ordering::Less,
        "lt" => ordering == Ordering::Less,
        "lte" => ordering != Ordering::Greater,
        "eq" => ordering == Ordering::Equal,
        _ => false,
    }
}

#[tauri::command]
fn local_evaluate_notifications(app: AppHandle, observations: Value) -> Result<Vec<Value>, String> {
    with_database(&app, |connection| {
        let rules = list_products(connection, Some("notification-rule"))?;
        let mut events = Vec::new();
        for record in rules {
            if record.value.get("enabled").and_then(Value::as_bool) != Some(true) {
                continue;
            }
            let source = record
                .value
                .get("source")
                .and_then(Value::as_str)
                .unwrap_or("");
            let field = record
                .value
                .get("field")
                .and_then(Value::as_str)
                .unwrap_or("");
            let threshold = record
                .value
                .get("threshold")
                .and_then(Value::as_str)
                .unwrap_or("");
            let observed = observations
                .get(source)
                .and_then(|value| value.get(field))
                .and_then(Value::as_str);
            let Some(observed) = observed else {
                continue;
            };
            let comparator = record
                .value
                .get("comparator")
                .and_then(Value::as_str)
                .unwrap_or("");
            if !matches_rule(comparator, decimal_cmp(observed, threshold)?) {
                continue;
            }
            let event_id = hex::encode(Sha256::digest(format!(
                "{}:{source}:{field}:{observed}:{threshold}",
                record.id
            )));
            let delivered: bool = connection
                .query_row(
                    "SELECT EXISTS(SELECT 1 FROM notification_deliveries WHERE event_id = ?1)",
                    [&event_id],
                    |row| row.get(0),
                )
                .map_err(|error| error.to_string())?;
            if !delivered {
                events.push(json!({ "eventId": event_id, "ruleId": record.id, "name": record.value.get("name").and_then(Value::as_str).unwrap_or("Alerta financiera"), "source": source, "field": field, "observed": observed, "threshold": threshold, "occurredAt": now() }));
            }
        }
        Ok(events)
    })
}

#[tauri::command]
fn local_mark_notification_delivered(
    app: AppHandle,
    event_id: String,
    rule_id: String,
    occurred_at: String,
) -> Result<(), String> {
    with_database(&app, |connection| {
        connection.execute("INSERT OR IGNORE INTO notification_deliveries (event_id,rule_id,occurred_at,delivered_at) VALUES (?1,?2,?3,?4)", params![event_id, rule_id, occurred_at, now()])
            .map_err(|error| error.to_string())?;
        Ok(())
    })
}

#[tauri::command]
fn local_notification_was_delivered(app: AppHandle, event_id: String) -> Result<bool, String> {
    with_database(&app, |connection| {
        connection
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM notification_deliveries WHERE event_id = ?1)",
                [event_id],
                |row| row.get(0),
            )
            .map_err(|error| error.to_string())
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            local_initialize,
            load_runtime_configuration,
            save_runtime_configuration,
            local_list_accounts,
            local_create_account,
            local_update_account,
            local_delete_account,
            local_list_transactions,
            local_create_transaction,
            local_update_transaction,
            local_delete_transaction,
            local_list_products,
            local_create_product,
            local_update_product,
            local_delete_product,
            local_add_shared_member,
            local_export_portable,
            local_import_portable,
            local_create_sync_backup,
            local_pending_changes,
            local_sync_pending_count,
            local_acknowledge_change,
            local_fail_change,
            local_set_sync_mapping,
            local_get_remote_id,
            local_merge_remote,
            local_evaluate_notifications,
            local_notification_was_delivered,
            local_mark_notification_delivered
        ])
        .run(tauri::generate_context!())
        .expect("error while running the 2 Free application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sqlcipher_reports_cipher_and_rejects_a_wrong_key() {
        let directory = tempfile::tempdir().expect("temporary directory");
        let path = directory.path().join("encrypted.db");
        let (connection, version) =
            open_encrypted(&path, "correct-test-key").expect("SQLCipher opens");
        assert!(!version.is_empty());
        connection
            .execute("CREATE TABLE proof (value TEXT)", [])
            .expect("create proof");
        connection
            .execute("INSERT INTO proof VALUES ('secret')", [])
            .expect("insert proof");
        drop(connection);

        let header = fs::read(&path).expect("read encrypted database");
        assert_ne!(&header[..16], b"SQLite format 3\0");
        let wrong = Connection::open(&path).expect("open file handle");
        wrong
            .pragma_update(None, "key", "wrong-test-key")
            .expect("set wrong key");
        assert!(wrong
            .query_row("SELECT count(*) FROM sqlite_master", [], |row| row
                .get::<_, i64>(0))
            .is_err());
    }

    #[test]
    fn encrypted_outbox_persists_failures_and_acknowledges_idempotently() {
        let directory = tempfile::tempdir().expect("temporary directory");
        let path = directory.path().join("sync.db");
        let (mut connection, _) = open_encrypted(&path, "sync-test-key").expect("open SQLCipher");
        let transaction = connection.transaction().expect("begin transaction");
        let operation_id = enqueue_change(
            &transaction,
            "product:budget",
            "budget-1",
            "update",
            &json!({ "riskPercent": "85" }),
        )
        .expect("enqueue");
        transaction.commit().expect("commit entity and outbox");
        drop(connection);

        let (connection, _) = open_encrypted(&path, "sync-test-key").expect("reopen SQLCipher");
        let pending: i64 = connection
            .query_row(
                "SELECT count(*) FROM sync_outbox WHERE acknowledged_at IS NULL",
                [],
                |row| row.get(0),
            )
            .expect("pending count");
        assert_eq!(pending, 1);
        connection.execute("UPDATE sync_outbox SET attempts=attempts+1,last_error='offline' WHERE operation_id=?1", [&operation_id]).expect("retain failure");
        connection.execute("UPDATE sync_outbox SET acknowledged_at=COALESCE(acknowledged_at,?1) WHERE operation_id=?2", params![now(), operation_id]).expect("acknowledge");
        connection.execute("UPDATE sync_outbox SET acknowledged_at=COALESCE(acknowledged_at,?1) WHERE operation_id=?2", params![now(), operation_id]).expect("idempotent acknowledge");
        let remaining: i64 = connection
            .query_row(
                "SELECT count(*) FROM sync_outbox WHERE acknowledged_at IS NULL",
                [],
                |row| row.get(0),
            )
            .expect("remaining count");
        assert_eq!(remaining, 0);
    }

    #[test]
    fn finance_mutations_validate_enqueue_and_refuse_dependent_account_deletes() {
        let directory = tempfile::tempdir().expect("temporary directory");
        let path = directory.path().join("finance.db");
        let (connection, _) = open_encrypted(&path, "finance-test-key").expect("open SQLCipher");
        let account = create_account_record(
            &connection,
            json!({
                "id": "account-1",
                "type": "debit",
                "label": "Daily account",
                "currency": "mxn",
                "metadata": {}
            }),
        )
        .expect("create account");
        assert_eq!(account["currency"], "MXN");
        create_transaction_record(
            &connection,
            json!({
                "id": "transaction-1",
                "accountId": "account-1",
                "amount": { "currency": "MXN", "coefficient": "1250", "scale": 2 },
                "metadata": { "category": "Food" }
            }),
        )
        .expect("create transaction");

        assert_eq!(
            update_account_record(
                &connection,
                "account-1",
                json!({ "type": "debit", "label": "  ", "currency": "MXN" })
            )
            .expect_err("blank labels stay invalid"),
            "La cuenta requiere un nombre."
        );
        assert_eq!(
            update_transaction_record(
                &connection,
                "transaction-1",
                json!({
                    "accountId": "account-1",
                    "amount": { "currency": "MXN", "coefficient": "12.50", "scale": 2 }
                })
            )
            .expect_err("invalid coefficients stay invalid"),
            "El coeficiente monetario no es válido."
        );
        assert_eq!(
            delete_account_record(&connection, "account-1")
                .expect_err("account deletion must refuse dependent transactions"),
            "No se puede eliminar una cuenta con transacciones asociadas."
        );

        let updated_account = update_account_record(
            &connection,
            "account-1",
            json!({
                "type": "yield",
                "label": "Savings",
                "currency": "mxn",
                "metadata": { "institution": "Bank" }
            }),
        )
        .expect("update account");
        assert_eq!(updated_account["label"], "Savings");
        assert_eq!(updated_account["createdAt"], account["createdAt"]);
        let updated_transaction = update_transaction_record(
            &connection,
            "transaction-1",
            json!({
                "accountId": "account-1",
                "amount": { "currency": "MXN", "coefficient": "2500", "scale": 2 },
                "metadata": { "category": "Groceries" }
            }),
        )
        .expect("update transaction");
        assert_eq!(updated_transaction["amount"]["coefficient"], "2500");

        delete_transaction_record(&connection, "transaction-1").expect("delete transaction");
        delete_account_record(&connection, "account-1").expect("delete empty account");
        let operations: Vec<(String, String, String)> = connection
            .prepare(
                "SELECT entity_kind,operation,payload_json FROM sync_outbox ORDER BY occurred_at,operation_id",
            )
            .expect("prepare outbox query")
            .query_map([], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)))
            .expect("query outbox")
            .collect::<Result<_, _>>()
            .expect("collect outbox");
        assert_eq!(operations.len(), 6);
        assert!(operations.iter().any(|entry| entry.0 == "account"
            && entry.1 == "update"
            && entry.2.contains("Savings")));
        assert!(operations
            .iter()
            .any(|entry| { entry.0 == "transaction" && entry.1 == "delete" && entry.2 == "null" }));
    }
}
