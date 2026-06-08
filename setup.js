require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");

const config = {
  host: process.env.DBHOST,
  port: process.env.DBPORT || 3306,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME,
  multipleStatements: true,
};

const SQL = `
CREATE TABLE IF NOT EXISTS \`admin\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) NOT NULL,
  \`email\` varchar(255) NOT NULL,
  \`password\` varchar(255) NOT NULL,
  \`role\` varchar(50) DEFAULT 'admin',
  \`tokenVersion\` int DEFAULT 0,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`), UNIQUE KEY \`email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`user\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) DEFAULT NULL,
  \`uid\` varchar(255) NOT NULL,
  \`email\` varchar(255) NOT NULL,
  \`password\` varchar(255) DEFAULT NULL,
  \`tokenVersion\` int DEFAULT 0,
  \`mobile_with_country_code\` varchar(50) DEFAULT NULL,
  \`trial\` tinyint DEFAULT 0,
  \`plan\` text DEFAULT NULL,
  \`plan_expire\` bigint DEFAULT NULL,
  \`api_key\` varchar(255) DEFAULT NULL,
  \`fcm_data\` text DEFAULT NULL,
  \`fcm_inbox\` tinyint DEFAULT 1,
  \`status\` varchar(50) DEFAULT 'OFFLINE',
  \`meta_data\` text DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`), UNIQUE KEY \`uid\` (\`uid\`), UNIQUE KEY \`email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`plan\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`title\` varchar(255) DEFAULT NULL,
  \`short_description\` text DEFAULT NULL,
  \`allow_tag\` tinyint DEFAULT 1,
  \`allow_note\` tinyint DEFAULT 1,
  \`allow_chatbot\` tinyint DEFAULT 1,
  \`contact_limit\` int DEFAULT 1000,
  \`allow_api\` tinyint DEFAULT 1,
  \`is_trial\` tinyint DEFAULT 0,
  \`price\` decimal(10,2) DEFAULT 0.00,
  \`price_strike\` decimal(10,2) DEFAULT 0.00,
  \`plan_duration_in_days\` int DEFAULT 30,
  \`qr_account\` int DEFAULT 1,
  \`wa_warmer\` tinyint DEFAULT 0,
  \`rest_api_qr\` tinyint DEFAULT 0,
  \`instagram_inbox\` tinyint DEFAULT 0,
  \`telegram_inbox\` tinyint DEFAULT 0,
  \`allow_wa_forms\` tinyint DEFAULT 0,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`web_public\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`logo\` varchar(255) DEFAULT NULL,
  \`app_name\` varchar(255) DEFAULT 'WhatsCRM',
  \`custom_home\` tinyint DEFAULT 0,
  \`tagline\` text DEFAULT NULL,
  \`about\` text DEFAULT NULL,
  \`contact_email\` varchar(255) DEFAULT NULL,
  \`contact_phone\` varchar(255) DEFAULT NULL,
  \`facebook\` varchar(255) DEFAULT NULL,
  \`twitter\` varchar(255) DEFAULT NULL,
  \`instagram_link\` varchar(255) DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`web_private\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`insta_app_id\` varchar(255) DEFAULT NULL,
  \`insta_app_secret\` varchar(255) DEFAULT NULL,
  \`stripe_key\` varchar(255) DEFAULT NULL,
  \`stripe_secret\` varchar(255) DEFAULT NULL,
  \`paypal_client_id\` varchar(255) DEFAULT NULL,
  \`paypal_secret\` varchar(255) DEFAULT NULL,
  \`mercadopago_key\` varchar(255) DEFAULT NULL,
  \`paystack_key\` varchar(255) DEFAULT NULL,
  \`paystack_secret\` varchar(255) DEFAULT NULL,
  \`firebase_config\` text DEFAULT NULL,
  \`smtp_host\` varchar(255) DEFAULT NULL,
  \`smtp_port\` varchar(10) DEFAULT NULL,
  \`smtp_user\` varchar(255) DEFAULT NULL,
  \`smtp_pass\` varchar(255) DEFAULT NULL,
  \`smtp_from\` varchar(255) DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`instance\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`title\` varchar(255) DEFAULT NULL,
  \`uniqueId\` varchar(255) DEFAULT NULL,
  \`status\` varchar(50) DEFAULT 'OFFLINE',
  \`mobile\` varchar(50) DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`chats\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`chat_id\` varchar(255) DEFAULT NULL,
  \`chat_note\` text DEFAULT NULL,
  \`chat_tags\` text DEFAULT NULL,
  \`chat_status\` varchar(50) DEFAULT 'open',
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`beta_chats\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`chat_label\` varchar(255) DEFAULT NULL,
  \`kanban_order\` int DEFAULT 0,
  \`unread_count\` int DEFAULT 0,
  \`phone\` varchar(50) DEFAULT NULL,
  \`name\` varchar(255) DEFAULT NULL,
  \`last_msg\` text DEFAULT NULL,
  \`last_msg_time\` bigint DEFAULT NULL,
  \`source\` varchar(50) DEFAULT NULL,
  \`instance_id\` varchar(255) DEFAULT NULL,
  \`profile_pic\` text DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`beta_conversation\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`chat_id\` varchar(255) DEFAULT NULL,
  \`msgContext\` text DEFAULT NULL,
  \`source\` varchar(50) DEFAULT NULL,
  \`instance_id\` varchar(255) DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`phonebook\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`title\` varchar(255) DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`contact\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`phonebook_id\` varchar(255) DEFAULT NULL,
  \`phonebook_name\` varchar(255) DEFAULT NULL,
  \`name\` varchar(255) DEFAULT NULL,
  \`mobile\` varchar(50) DEFAULT NULL,
  \`var1\` varchar(255) DEFAULT NULL,
  \`var2\` varchar(255) DEFAULT NULL,
  \`var3\` varchar(255) DEFAULT NULL,
  \`var4\` varchar(255) DEFAULT NULL,
  \`var5\` varchar(255) DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`meta_api\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`waba_id\` varchar(255) DEFAULT NULL,
  \`access_token\` text DEFAULT NULL,
  \`business_phone_number_id\` varchar(255) DEFAULT NULL,
  \`app_id\` varchar(255) DEFAULT NULL,
  \`login_type\` varchar(50) DEFAULT NULL,
  \`embed_data\` text DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`meta_templet_media\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`templet_name\` varchar(255) DEFAULT NULL,
  \`meta_hash\` varchar(255) DEFAULT NULL,
  \`file_name\` varchar(255) DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`broadcast\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`broadcast_id\` varchar(255) DEFAULT NULL,
  \`uid\` varchar(255) DEFAULT NULL,
  \`title\` varchar(255) DEFAULT NULL,
  \`templet\` text DEFAULT NULL,
  \`phonebook\` text DEFAULT NULL,
  \`status\` varchar(50) DEFAULT 'PENDING',
  \`schedule\` varchar(255) DEFAULT NULL,
  \`timezone\` varchar(100) DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`broadcast_log\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`broadcast_id\` varchar(255) DEFAULT NULL,
  \`uid\` varchar(255) DEFAULT NULL,
  \`phone\` varchar(50) DEFAULT NULL,
  \`status\` varchar(50) DEFAULT NULL,
  \`msg_id\` varchar(255) DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`beta_campaign\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`campaign_id\` varchar(255) DEFAULT NULL,
  \`uid\` varchar(255) DEFAULT NULL,
  \`title\` varchar(255) DEFAULT NULL,
  \`status\` varchar(50) DEFAULT 'PENDING',
  \`data\` text DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`beta_campaign_logs\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`campaign_id\` varchar(255) DEFAULT NULL,
  \`uid\` varchar(255) DEFAULT NULL,
  \`phone\` varchar(50) DEFAULT NULL,
  \`status\` varchar(50) DEFAULT NULL,
  \`msg_id\` varchar(255) DEFAULT NULL,
  \`data\` text DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`flow\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`flow_id\` varchar(255) DEFAULT NULL,
  \`name\` varchar(255) DEFAULT NULL,
  \`data\` text DEFAULT NULL,
  \`ai_list\` text DEFAULT NULL,
  \`prevent_list\` text DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`beta_flows\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`flow_id\` varchar(255) DEFAULT NULL,
  \`source\` varchar(50) DEFAULT NULL,
  \`name\` varchar(255) DEFAULT NULL,
  \`data\` longtext DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`flow_session\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`flow_id\` varchar(255) DEFAULT NULL,
  \`sender_mobile\` varchar(50) DEFAULT NULL,
  \`data\` text DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`beta_chatbot\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`source\` varchar(50) DEFAULT NULL,
  \`title\` varchar(255) DEFAULT NULL,
  \`flow_id\` varchar(255) DEFAULT NULL,
  \`origin\` varchar(255) DEFAULT NULL,
  \`origin_id\` varchar(255) DEFAULT NULL,
  \`active\` tinyint DEFAULT 1,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`chatbot\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`active\` tinyint DEFAULT 1,
  \`data\` text DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`templets\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`content\` text DEFAULT NULL,
  \`type\` varchar(50) DEFAULT NULL,
  \`title\` varchar(255) DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`contact_form\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`email\` varchar(255) DEFAULT NULL,
  \`name\` varchar(255) DEFAULT NULL,
  \`mobile\` varchar(50) DEFAULT NULL,
  \`content\` text DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`gen_links\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`wa_mobile\` varchar(50) DEFAULT NULL,
  \`email\` varchar(255) DEFAULT NULL,
  \`msg\` text DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`agents\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`owner_uid\` varchar(255) DEFAULT NULL,
  \`uid\` varchar(255) DEFAULT NULL,
  \`email\` varchar(255) DEFAULT NULL,
  \`password\` varchar(255) DEFAULT NULL,
  \`name\` varchar(255) DEFAULT NULL,
  \`mobile\` varchar(50) DEFAULT NULL,
  \`comments\` text DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`agent_task\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`owner_uid\` varchar(255) DEFAULT NULL,
  \`agent_uid\` varchar(255) DEFAULT NULL,
  \`status\` varchar(50) DEFAULT 'PENDING',
  \`data\` text DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`telegram_session\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`session_id\` varchar(255) DEFAULT NULL,
  \`status\` varchar(50) DEFAULT 'OFFLINE',
  \`data\` text DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`instagram_accounts\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`account_id\` varchar(255) DEFAULT NULL,
  \`access_token\` text DEFAULT NULL,
  \`name\` varchar(255) DEFAULT NULL,
  \`status\` varchar(50) DEFAULT 'ACTIVE',
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`wa_call_logs\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`data\` text DEFAULT NULL,
  \`status\` varchar(50) DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`beta_api_logs\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`msg_id\` varchar(255) DEFAULT NULL,
  \`request\` text DEFAULT NULL,
  \`response\` text DEFAULT NULL,
  \`status\` varchar(50) DEFAULT NULL,
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`wa_forms\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`name\` varchar(255) DEFAULT NULL,
  \`description\` text DEFAULT NULL,
  \`flow_id\` varchar(255) DEFAULT NULL,
  \`flow_status\` varchar(50) DEFAULT NULL,
  \`fields_json\` text DEFAULT NULL,
  \`createdAt\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`wa_form_submissions\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`flow_id\` varchar(255) DEFAULT NULL,
  \`form_name\` varchar(255) DEFAULT NULL,
  \`from_phone\` varchar(50) DEFAULT NULL,
  \`raw_payload\` text DEFAULT NULL,
  \`createdAt\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`orders\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`uid\` varchar(255) DEFAULT NULL,
  \`payment_mode\` varchar(50) DEFAULT NULL,
  \`amount\` decimal(10,2) DEFAULT NULL,
  \`data\` text DEFAULT NULL,
  \`s_token\` varchar(255) DEFAULT NULL,
  \`status\` varchar(50) DEFAULT 'PENDING',
  \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

async function setup() {
  console.log("🔄 Connecting to database...");
  const conn = await mysql.createConnection(config);
  console.log("✅ Connected!");

  console.log("🔄 Creating tables...");
  await conn.query(SQL);
  console.log("✅ All tables created!");

  // Insert default data
  const [webPublic] = await conn.query("SELECT id FROM web_public LIMIT 1");
  if (webPublic.length === 0) {
    await conn.query(
      "INSERT INTO web_public (app_name, custom_home) VALUES (?, ?)",
      ["WhatsCRM", 0]
    );
    console.log("✅ web_public initialized");
  }

  const [webPrivate] = await conn.query("SELECT id FROM web_private LIMIT 1");
  if (webPrivate.length === 0) {
    await conn.query("INSERT INTO web_private () VALUES ()");
    console.log("✅ web_private initialized");
  }

  // Create default plan
  const [plans] = await conn.query("SELECT id FROM plan LIMIT 1");
  if (plans.length === 0) {
    await conn.query(
      `INSERT INTO plan (title, short_description, allow_tag, allow_note, allow_chatbot,
        contact_limit, allow_api, is_trial, price, price_strike, plan_duration_in_days,
        qr_account, wa_warmer, rest_api_qr, instagram_inbox, telegram_inbox, allow_wa_forms)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      ["Basic Plan", "Default plan", 1, 1, 1, 1000, 1, 0, 29.99, 49.99, 30, 1, 0, 0, 0, 0, 0]
    );
    console.log("✅ Default plan created");
  }

  // Create admin account
  const ADMIN_EMAIL = "admin@admin.com";
  const ADMIN_PASS = "Admin@1234";

  const [existing] = await conn.query("SELECT id FROM admin WHERE email = ?", [ADMIN_EMAIL]);
  if (existing.length === 0) {
    const hash = await bcrypt.hash(ADMIN_PASS, 10);
    const uid = randomstring.generate(20);
    await conn.query(
      "INSERT INTO admin (uid, email, password, role, tokenVersion) VALUES (?,?,?,?,?)",
      [uid, ADMIN_EMAIL, hash, "admin", 0]
    );
    console.log("✅ Admin account created!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email   : " + ADMIN_EMAIL);
    console.log("🔑 Password: " + ADMIN_PASS);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } else {
    console.log("ℹ️  Admin already exists, skipping.");
  }

  await conn.end();
  console.log("🎉 Setup complete!");
  process.exit(0);
}

setup().catch((err) => {
  console.error("❌ Setup failed:", err.message);
  process.exit(1);
});
