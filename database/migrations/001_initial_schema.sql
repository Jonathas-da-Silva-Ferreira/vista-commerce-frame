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