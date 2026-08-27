-- ==========================================================================
-- Vista Commerce
-- Initial MySQL Schema
-- ==========================================================================
--
-- This migration adapts the original Supabase/PostgreSQL
-- data model to MySQL 8.
--
-- The original Supabase project used auth.users as the
-- identity source. In this project, users are represented by our own users table.
-- =============================================================================



-- =============================================================================
-- USERS
-- =============================================================================
-- Adaptation from Supabase auth.users.
-- Authentication is implamentation will be handled by the API.
-- =============================================================================

CREATE TABLE users (
    id CHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    crated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- =============================================================================
-- PROFILES
-- =============================================================================

CREATE TABLE profiles (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    avatar_url VARCHAR(2048),
    status ENUM('active', 'suspended')NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uq_profiles_user_id (user_id),

    CONSTRAINT fk_profiles_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- USER ROLES
-- =============================================================================

CREATE TABLE user_roles (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    role ENUM('admin', 'seller', 'customer') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id), 

    UNIQUE KEY uq_user_roles_user_id_role (user_id, role),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;

-- =============================================================================
-- CATEGORIES
-- =============================================================================

CREATE TABLE categories (
    id CHAR (36) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_id CHAR(36),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY ue_categories_slug (slug),

    KEY idx_categories_parent_id (parent_id),

    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_id)
        REFERENCES categories (id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================================================
-- PRODUCTS
-- =============================================================================

CREATE TABLE products (
    id CHAR(36) NOT NULL,
    seller_id CHAR(36) NOT NULL,
    category_id CHAR(36),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_url VARCHAR(2048),
    status ENUM('active','hiden', 'delete')NOT NULL DEFAULT 'active',
    sales_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_products_seller_id (seller_id),
    kEY idx_products_category_id (category_id),
    KEY idx_products_status (status),

    CONSTRAINT chk_products_price
        CHECK (price >= 0),

    CONSTRAINT chk_products_stock
        CHECK (stock >= 0),

    CONSTRAINT chk_products_sales_count
        CHECK (sales_count >= 0),

    CONSTRAINT fk_products_seller
        FOREIGN KEY (seller_id)
        REFERENCES users (id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories (id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================================================
-- BANNERS
-- =============================================================================

CREATE TABLE banners (
    id CHAR(36) NOR NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url VARCHAR(2048) NOR NULL,
    link_url VARCHAR(2048),
    position INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    start_at TIMESTAMP NULL,
    ends_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_STIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_banners_position (active),
    KEY idx_banners_position (position)

) ENGINE-InnoDB;

-- =============================================================================
-- ORDERS
-- =============================================================================

CREATE TABLE orders (
    id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM(
        'pending',
        'paid',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
    ) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_orders_user_id (user_id),
    KEY idx_orders_status (status),

    CONSTRAINT chk_orders_total 
        CHECK (total >=0),

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
)ENGINE=InnoDB;

-- =============================================================================
-- ORDER ITEMS
-- =============================================================================

CREATE TABLE order_items (
    id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36),
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_order_items_order_id (order_id),
    KEY idx_order_items_product_id (product_id),

    CONSTRAINT chk_order_items_unit_price
        CHECK (unit_price >=0),

    CONSTRAINT fk_order_items_order
        CHECK  (quantity > 0),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE SET NULL
)ENGINE=InnoDB;

-- =============================================================================
-- REVIEWS
-- =============================================================================
CREATE TABLE reviews (
    id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    rating SMALLINT NOT NULL,
    title VARCHAR(255),
    comment VARCHAR(2000) NOT NULL,
    verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY  uq_reviews_product_user (product_id, user_id),

    KEY idx_reviews_product_created (product_id, created_at),

    CONSTRAINT chk_reviews_rating
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT fk_reviews_product
        FOREIGN KEY (product_id)
        REFERENCES products (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
)ENGINE_InnoDB;