SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict QPEGvntL6yLfBONQxfPsBDSLxXiaKNgaRa7LhxdNRICgzQq98wQlekYGTN7718s

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', 'authenticated', 'authenticated', 'qualidade_rt@medic.com.br', '$2a$10$f7/2Znf1hrozISTyEBTileNs.N/MX0l.5e8uIvhiweFpF8fb997fC', '2026-07-09 17:00:22.725237+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-19 11:57:59.434031+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-09 17:00:22.722496+00', '2026-09-04 18:18:36.349933+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2a75623c-5cbc-4c2a-a6ac-7b4d40b5e916', 'authenticated', 'authenticated', 'instrumentacao@medic.com.br', '$2a$10$OYuvsRsD.Tl.SSbb2eIGHuUZKsdDRC1Bq7UwpSI3/KGymFDotbJx.', '2026-07-09 16:58:43.302549+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-09 16:58:43.300122+00', '2026-07-09 16:58:43.303309+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', 'authenticated', 'authenticated', 'comercial_interno@medic.com.br', '$2a$10$COEl95a1Bp6tEdL/.21i3ebLB3YweL0kDgnfuu1OrEfFGazdQGdDi', '2026-07-09 16:58:03.669425+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-09-03 16:56:14.898005+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-09 16:58:03.66046+00', '2026-09-03 19:19:37.769549+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', 'authenticated', 'authenticated', 't_i@medic.com.br', '$2a$10$dZG7.lUlvosYv/fIJ.kZ.O/k0SXesA0r9taxJNycsEVycs/l0DPX2', '2026-07-09 16:59:39.073042+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-09-08 15:28:06.03862+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-09 16:59:39.05075+00', '2026-09-08 17:05:43.057289+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9f04dc3b-e3dd-46b6-a6ec-d7e5e55f6ef1', 'authenticated', 'authenticated', 'financeiro@medic.com.br', '$2a$10$SY5KxNkvoz/pdSuKPmLF5e1ey7KwWXPxw53aAs1q3jCuqFJgrqGrK', '2026-07-09 17:01:46.961297+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-19 17:34:53.413199+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-09 17:01:46.95359+00', '2026-08-19 17:34:53.427359+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '82be8c87-af48-4018-8f2d-ab9e1d678111', 'authenticated', 'authenticated', 'gestor_diogo@medic.com.br', '$2a$10$WjygWXPOzH18UYMRvMr.V.7H7eRH6jKk5Bo0xgtSGFDL3FV5XzPUu', '2026-07-29 15:36:19.622296+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-07-29 19:33:14.817206+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-29 15:36:19.595202+00', '2026-07-31 16:43:31.566445+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ea2e3db0-95d0-468e-b1ce-8d2b46b24666', 'authenticated', 'authenticated', 'supply_chain@medic.com.br', '$2a$10$gxmduiJjp3k4AgadvUmu2uqSmCm.LKKdSDWA7P75hKpZXWnuEWeDy', '2026-07-09 17:02:59.129298+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-09 17:02:59.118109+00', '2026-07-09 17:02:59.130297+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '22ebb927-6ee6-44fd-8cb6-20fe159758b1', 'authenticated', 'authenticated', 'compras@medic.com.br', '$2a$10$TemEwXVNgxlG6njHFVfdXOWIOlqU..E/ms9ODD7jh19FUDmtnPr8m', '2026-07-09 17:03:29.224174+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-27 11:38:46.710645+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-09 17:03:29.218023+00', '2026-08-31 19:00:40.254902+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f50b752d-fd78-4409-aaca-ad36820124c8', 'authenticated', 'authenticated', 'operacoes@medic.com.br', '$2a$10$umLyBLud2naGKx.29B8sTOi.0c5PuXAVJrvDhZDhQLkdBca.AfSiO', '2026-07-09 17:04:06.429601+00', NULL, '', NULL, '22722e5a96a04a03315f45d6511bcd322766e3850d6a405f6bf7fe3a', '2026-08-25 14:39:24.766321+00', '', '', NULL, '2026-09-08 14:49:08.028796+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-09 17:04:06.426779+00', '2026-09-08 14:49:08.042068+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '1faf3776-3fca-4cf8-8489-dce99a888e06', 'authenticated', 'authenticated', 'estoque_e_logistica@medic.com.br', '$2a$10$qx2k3vKFm8rxMZ1Ns73jy.pvcIZpA2u0PjgIDH3cJDjX3uR5LvOqi', '2026-07-09 17:02:14.325417+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-09-03 12:07:10.044506+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-09 17:02:14.32083+00', '2026-09-03 19:07:18.796377+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f761c53c-68c7-4c52-aa82-41d6bea038b1', 'authenticated', 'authenticated', 'gente_gestao@medic.com.br', '$2a$10$mreXloSvPZj1OcJaC7eanOBscD9Ne8k1v6hM.gwkp1IyQQQB866O6', '2026-07-09 17:01:02.470185+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-28 17:39:37.538284+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-09 17:01:02.46759+00', '2026-09-04 11:36:41.043949+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '7f71468a-f5c0-4ba3-89b6-ed385356e1c0', 'authenticated', 'authenticated', 'comercial_externo@medic.com.br', '$2a$10$IayApYYvJzN8e2uroJjg3./HBkJXpWZCGhKHKEaIu9RqyO/exEBB.', '2026-07-09 16:56:50.803536+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-08-25 15:37:31.661801+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-07-09 16:56:50.791546+00', '2026-08-25 17:05:38.864049+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('7f71468a-f5c0-4ba3-89b6-ed385356e1c0', '7f71468a-f5c0-4ba3-89b6-ed385356e1c0', '{"sub": "7f71468a-f5c0-4ba3-89b6-ed385356e1c0", "email": "comercial_externo@medic.com.br", "email_verified": false, "phone_verified": false}', 'email', '2026-07-09 16:56:50.799553+00', '2026-07-09 16:56:50.799606+00', '2026-07-09 16:56:50.799606+00', '18d1e20a-2d70-40a6-b21a-b6f19460aa0f'),
	('ccad1568-f55e-4d05-9cb4-de650cd313a4', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', '{"sub": "ccad1568-f55e-4d05-9cb4-de650cd313a4", "email": "comercial_interno@medic.com.br", "email_verified": false, "phone_verified": false}', 'email', '2026-07-09 16:58:03.667302+00', '2026-07-09 16:58:03.667363+00', '2026-07-09 16:58:03.667363+00', '74ddc045-28bc-4bbc-87c3-554a639bc64b'),
	('2a75623c-5cbc-4c2a-a6ac-7b4d40b5e916', '2a75623c-5cbc-4c2a-a6ac-7b4d40b5e916', '{"sub": "2a75623c-5cbc-4c2a-a6ac-7b4d40b5e916", "email": "instrumentacao@medic.com.br", "email_verified": false, "phone_verified": false}', 'email', '2026-07-09 16:58:43.301206+00', '2026-07-09 16:58:43.301252+00', '2026-07-09 16:58:43.301252+00', '7ec76db0-7797-4152-9ed7-d4045af0f944'),
	('a8b7d226-a0c1-4cca-acf0-c7aea267cce3', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '{"sub": "a8b7d226-a0c1-4cca-acf0-c7aea267cce3", "email": "t_i@medic.com.br", "email_verified": false, "phone_verified": false}', 'email', '2026-07-09 16:59:39.06988+00', '2026-07-09 16:59:39.069958+00', '2026-07-09 16:59:39.069958+00', '66c286b0-46ca-4214-965f-06c70cf29a82'),
	('dc3b83dd-f51d-45a9-a138-6bcffd255071', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', '{"sub": "dc3b83dd-f51d-45a9-a138-6bcffd255071", "email": "qualidade_rt@medic.com.br", "email_verified": false, "phone_verified": false}', 'email', '2026-07-09 17:00:22.723657+00', '2026-07-09 17:00:22.723709+00', '2026-07-09 17:00:22.723709+00', 'dd599f04-c861-49f8-bb2d-22085566503c'),
	('f761c53c-68c7-4c52-aa82-41d6bea038b1', 'f761c53c-68c7-4c52-aa82-41d6bea038b1', '{"sub": "f761c53c-68c7-4c52-aa82-41d6bea038b1", "email": "gente_gestao@medic.com.br", "email_verified": false, "phone_verified": false}', 'email', '2026-07-09 17:01:02.468694+00', '2026-07-09 17:01:02.468744+00', '2026-07-09 17:01:02.468744+00', 'b1fd6906-f2b5-4271-a86d-03f190912a23'),
	('9f04dc3b-e3dd-46b6-a6ec-d7e5e55f6ef1', '9f04dc3b-e3dd-46b6-a6ec-d7e5e55f6ef1', '{"sub": "9f04dc3b-e3dd-46b6-a6ec-d7e5e55f6ef1", "email": "financeiro@medic.com.br", "email_verified": false, "phone_verified": false}', 'email', '2026-07-09 17:01:46.959633+00', '2026-07-09 17:01:46.959699+00', '2026-07-09 17:01:46.959699+00', '789fcd66-b2e1-46e7-bdfb-ae3044094a50'),
	('1faf3776-3fca-4cf8-8489-dce99a888e06', '1faf3776-3fca-4cf8-8489-dce99a888e06', '{"sub": "1faf3776-3fca-4cf8-8489-dce99a888e06", "email": "estoque_e_logistica@medic.com.br", "email_verified": false, "phone_verified": false}', 'email', '2026-07-09 17:02:14.323786+00', '2026-07-09 17:02:14.323833+00', '2026-07-09 17:02:14.323833+00', 'b9b5806c-ab18-49b5-9fe9-66754ce3cd01'),
	('ea2e3db0-95d0-468e-b1ce-8d2b46b24666', 'ea2e3db0-95d0-468e-b1ce-8d2b46b24666', '{"sub": "ea2e3db0-95d0-468e-b1ce-8d2b46b24666", "email": "supply_chain@medic.com.br", "email_verified": false, "phone_verified": false}', 'email', '2026-07-09 17:02:59.126699+00', '2026-07-09 17:02:59.126768+00', '2026-07-09 17:02:59.126768+00', 'c3a4bfe6-d224-46c8-aa74-5987d4cf5c08'),
	('22ebb927-6ee6-44fd-8cb6-20fe159758b1', '22ebb927-6ee6-44fd-8cb6-20fe159758b1', '{"sub": "22ebb927-6ee6-44fd-8cb6-20fe159758b1", "email": "compras@medic.com.br", "email_verified": false, "phone_verified": false}', 'email', '2026-07-09 17:03:29.22252+00', '2026-07-09 17:03:29.222605+00', '2026-07-09 17:03:29.222605+00', '4bcc7d09-e4b7-470c-8dcd-2ac2b9a1ea35'),
	('f50b752d-fd78-4409-aaca-ad36820124c8', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{"sub": "f50b752d-fd78-4409-aaca-ad36820124c8", "email": "operacoes@medic.com.br", "email_verified": false, "phone_verified": false}', 'email', '2026-07-09 17:04:06.427993+00', '2026-07-09 17:04:06.428038+00', '2026-07-09 17:04:06.428038+00', '1b11d76d-ed9f-4866-be10-a321476a481d'),
	('82be8c87-af48-4018-8f2d-ab9e1d678111', '82be8c87-af48-4018-8f2d-ab9e1d678111', '{"sub": "82be8c87-af48-4018-8f2d-ab9e1d678111", "email": "gestor_diogo@medic.com.br", "email_verified": false, "phone_verified": false}', 'email', '2026-07-29 15:36:19.614478+00', '2026-07-29 15:36:19.614556+00', '2026-07-29 15:36:19.614556+00', '7504de85-27e8-40f9-8e1e-0f4a043f3b06');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('6b35f415-d5b8-4119-8e3d-1abc85a84587', '22ebb927-6ee6-44fd-8cb6-20fe159758b1', '2026-08-27 11:38:46.710751+00', '2026-08-31 19:00:40.27097+00', NULL, 'aal1', NULL, '2026-08-31 19:00:40.270845', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '200.187.161.24', NULL, NULL, NULL, NULL, NULL),
	('20a12d0e-b95a-423b-8938-de73c0f7ebbe', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', '2026-08-28 18:27:39.710055+00', '2026-08-28 19:26:28.166744+00', NULL, 'aal1', NULL, '2026-08-28 19:26:28.166625', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '200.187.161.24', NULL, NULL, NULL, NULL, NULL),
	('1038acf1-1212-42f5-9676-fc1ea5f7b923', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-09-02 11:45:06.882237+00', '2026-09-04 13:31:24.583953+00', NULL, 'aal1', NULL, '2026-09-04 13:31:24.583824', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '200.187.161.186', NULL, NULL, NULL, NULL, NULL),
	('92827c6c-2abb-4709-89c1-21dcbb0ba1e4', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', '2026-08-27 17:27:12.990384+00', '2026-09-03 11:30:45.174181+00', NULL, 'aal1', NULL, '2026-09-03 11:30:45.174042', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '200.187.161.186', NULL, NULL, NULL, NULL, NULL),
	('83195aac-f9a1-4650-a440-5db14f3ff20b', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-09-02 01:42:49.816175+00', '2026-09-02 01:42:49.816175+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1', '45.4.56.150', NULL, NULL, NULL, NULL, NULL),
	('4b0e7309-205d-47e1-848f-dd79bdb4b88a', '9f04dc3b-e3dd-46b6-a6ec-d7e5e55f6ef1', '2026-08-19 17:34:53.413303+00', '2026-08-19 17:34:53.413303+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0', '200.187.161.52', NULL, NULL, NULL, NULL, NULL),
	('d8bac4f3-d303-4702-bbb7-da427a9a6868', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', '2026-08-19 11:57:59.434132+00', '2026-09-04 18:18:36.353276+00', NULL, 'aal1', NULL, '2026-09-04 18:18:36.353141', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6.1 Mobile/15E148 Safari/604.1', '187.21.13.22', NULL, NULL, NULL, NULL, NULL),
	('09b421f0-2e25-4c25-a5bc-a864e3ff77f2', '1faf3776-3fca-4cf8-8489-dce99a888e06', '2026-09-03 12:07:10.048331+00', '2026-09-03 19:07:18.814322+00', NULL, 'aal1', NULL, '2026-09-03 19:07:18.814211', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '206.43.21.121', NULL, NULL, NULL, NULL, NULL),
	('db6c4173-5b26-4c03-863e-8682fbc50a6f', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', '2026-09-03 16:56:14.898974+00', '2026-09-03 19:19:37.784064+00', NULL, 'aal1', NULL, '2026-09-03 19:19:37.783941', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0', '200.187.161.186', NULL, NULL, NULL, NULL, NULL),
	('5916fe58-cb94-47a2-80ba-0c0e77b16003', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-09-08 14:49:08.030265+00', '2026-09-08 14:49:08.030265+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '177.69.199.93', NULL, NULL, NULL, NULL, NULL),
	('47ce6821-1e08-4299-ac6d-00e0dafd92c3', 'f761c53c-68c7-4c52-aa82-41d6bea038b1', '2026-08-28 17:39:37.539056+00', '2026-09-04 11:36:41.060804+00', NULL, 'aal1', NULL, '2026-09-04 11:36:41.06069', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '45.165.22.173', NULL, NULL, NULL, NULL, NULL),
	('13cde8c2-80d9-474e-aebc-f2c1638b33d0', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '2026-09-08 15:28:06.039505+00', '2026-09-08 16:26:41.620094+00', NULL, 'aal1', NULL, '2026-09-08 16:26:41.619935', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '177.69.199.93', NULL, NULL, NULL, NULL, NULL),
	('bfc56816-be28-4da7-bc68-cce9ea3811d1', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '2026-09-08 14:48:19.31836+00', '2026-09-08 17:05:43.069399+00', NULL, 'aal1', NULL, '2026-09-08 17:05:43.069293', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '200.216.167.66', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('d8bac4f3-d303-4702-bbb7-da427a9a6868', '2026-08-19 11:57:59.472871+00', '2026-08-19 11:57:59.472871+00', 'password', '49984810-56b2-408b-ab61-7c643c81c660'),
	('1038acf1-1212-42f5-9676-fc1ea5f7b923', '2026-09-02 11:45:06.907744+00', '2026-09-02 11:45:06.907744+00', 'password', '1ef544db-3eb9-416e-8945-ca40d11ef818'),
	('4b0e7309-205d-47e1-848f-dd79bdb4b88a', '2026-08-19 17:34:53.429926+00', '2026-08-19 17:34:53.429926+00', 'password', '137b086b-d586-491e-a4e7-adce5ef984c1'),
	('09b421f0-2e25-4c25-a5bc-a864e3ff77f2', '2026-09-03 12:07:10.135496+00', '2026-09-03 12:07:10.135496+00', 'password', '6dba8a4f-7245-4dbb-92b9-78aeafb26a2b'),
	('db6c4173-5b26-4c03-863e-8682fbc50a6f', '2026-09-03 16:56:14.960901+00', '2026-09-03 16:56:14.960901+00', 'password', '67a46762-dc48-49d2-a653-387530f90fe3'),
	('bfc56816-be28-4da7-bc68-cce9ea3811d1', '2026-09-08 14:48:19.3251+00', '2026-09-08 14:48:19.3251+00', 'password', '80ac9b56-68d3-48a1-9ffc-b71964124276'),
	('5916fe58-cb94-47a2-80ba-0c0e77b16003', '2026-09-08 14:49:08.044507+00', '2026-09-08 14:49:08.044507+00', 'password', '0095a827-4ccd-4867-bfc8-1cf9ab11a25b'),
	('13cde8c2-80d9-474e-aebc-f2c1638b33d0', '2026-09-08 15:28:06.086326+00', '2026-09-08 15:28:06.086326+00', 'password', 'efcff939-c073-4042-aaef-1a6526cc073b'),
	('6b35f415-d5b8-4119-8e3d-1abc85a84587', '2026-08-27 11:38:46.793008+00', '2026-08-27 11:38:46.793008+00', 'password', '050f2b94-a58a-47ea-bc8f-6672b2354300'),
	('92827c6c-2abb-4709-89c1-21dcbb0ba1e4', '2026-08-27 17:27:13.049449+00', '2026-08-27 17:27:13.049449+00', 'password', '0e41f6cb-b255-4082-a33b-da7c4bd4310c'),
	('47ce6821-1e08-4299-ac6d-00e0dafd92c3', '2026-08-28 17:39:37.576463+00', '2026-08-28 17:39:37.576463+00', 'password', 'b16526cb-f6c8-4615-94ec-cc707f9db365'),
	('20a12d0e-b95a-423b-8938-de73c0f7ebbe', '2026-08-28 18:27:39.730575+00', '2026-08-28 18:27:39.730575+00', 'password', 'e5341c48-da8a-449f-a76e-6687580b3d41'),
	('83195aac-f9a1-4650-a440-5db14f3ff20b', '2026-09-02 01:42:49.830039+00', '2026-09-02 01:42:49.830039+00', 'password', 'ac917339-7db2-4c3e-9bab-7f7824581977');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") VALUES
	('c8f63200-8826-4fc8-a5e2-3d818a2ae5af', 'f50b752d-fd78-4409-aaca-ad36820124c8', 'recovery_token', '22722e5a96a04a03315f45d6511bcd322766e3850d6a405f6bf7fe3a', 'operacoes@medic.com.br', '2026-08-25 14:39:27.17123', '2026-08-25 14:39:27.17123');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 623, 'jmtl3lln75gs', 'f50b752d-fd78-4409-aaca-ad36820124c8', false, '2026-09-08 14:49:08.039639+00', '2026-09-08 14:49:08.039639+00', NULL, '5916fe58-cb94-47a2-80ba-0c0e77b16003'),
	('00000000-0000-0000-0000-000000000000', 626, 'phwyn3rwuuoo', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', false, '2026-09-08 16:26:41.586069+00', '2026-09-08 16:26:41.586069+00', 'wgnidypnslrh', '13cde8c2-80d9-474e-aebc-f2c1638b33d0'),
	('00000000-0000-0000-0000-000000000000', 559, '4mbg2nysfqtu', 'f50b752d-fd78-4409-aaca-ad36820124c8', true, '2026-09-02 13:50:43.508862+00', '2026-09-03 11:19:14.539063+00', 'dyusrale2rku', '1038acf1-1212-42f5-9676-fc1ea5f7b923'),
	('00000000-0000-0000-0000-000000000000', 569, 'v7ywpjpck4uh', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', false, '2026-09-03 11:30:45.14208+00', '2026-09-03 11:30:45.14208+00', 'ja7cf2p5yt7u', '92827c6c-2abb-4709-89c1-21dcbb0ba1e4'),
	('00000000-0000-0000-0000-000000000000', 572, '3gprraph6hyi', 'f50b752d-fd78-4409-aaca-ad36820124c8', true, '2026-09-03 12:17:48.696288+00', '2026-09-03 13:16:44.58237+00', 'xgwz7jj46ejb', '1038acf1-1212-42f5-9676-fc1ea5f7b923'),
	('00000000-0000-0000-0000-000000000000', 355, 'csghsfz7mutj', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-08-19 13:51:19.80357+00', '2026-08-24 15:15:50.417029+00', 'b2wyu4q6qmtd', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 575, '6mcqfxu22smv', 'f50b752d-fd78-4409-aaca-ad36820124c8', true, '2026-09-03 13:16:44.591091+00', '2026-09-03 14:23:02.315977+00', '3gprraph6hyi', '1038acf1-1212-42f5-9676-fc1ea5f7b923'),
	('00000000-0000-0000-0000-000000000000', 578, '7ssl6kkqlfaw', '1faf3776-3fca-4cf8-8489-dce99a888e06', true, '2026-09-03 14:07:18.787699+00', '2026-09-03 15:07:19.003511+00', 'hwxydrrgn4ww', '09b421f0-2e25-4c25-a5bc-a864e3ff77f2'),
	('00000000-0000-0000-0000-000000000000', 352, 'b2wyu4q6qmtd', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-08-19 11:57:59.458758+00', '2026-08-19 13:51:19.792082+00', NULL, 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 553, 'gxrlzjl4364e', 'f50b752d-fd78-4409-aaca-ad36820124c8', false, '2026-09-02 01:42:49.82383+00', '2026-09-02 01:42:49.82383+00', NULL, '83195aac-f9a1-4650-a440-5db14f3ff20b'),
	('00000000-0000-0000-0000-000000000000', 587, 'wsrgrg5wa5th', '1faf3776-3fca-4cf8-8489-dce99a888e06', true, '2026-09-03 16:07:18.949968+00', '2026-09-03 17:07:18.801271+00', 'oecgrzkepktq', '09b421f0-2e25-4c25-a5bc-a864e3ff77f2'),
	('00000000-0000-0000-0000-000000000000', 590, 'hj6larbrkzev', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', true, '2026-09-03 16:56:14.934657+00', '2026-09-03 17:55:22.671272+00', NULL, 'db6c4173-5b26-4c03-863e-8682fbc50a6f'),
	('00000000-0000-0000-0000-000000000000', 363, '2r27k77dbhxs', '9f04dc3b-e3dd-46b6-a6ec-d7e5e55f6ef1', false, '2026-08-19 17:34:53.424905+00', '2026-08-19 17:34:53.424905+00', NULL, '4b0e7309-205d-47e1-848f-dd79bdb4b88a'),
	('00000000-0000-0000-0000-000000000000', 600, 'mk26rpb6qqca', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', false, '2026-09-03 19:19:37.764525+00', '2026-09-03 19:19:37.764525+00', 'ix44z4jmpiio', 'db6c4173-5b26-4c03-863e-8682fbc50a6f'),
	('00000000-0000-0000-0000-000000000000', 423, '2u4ppmvc3oao', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-08-25 22:53:30.653709+00', '2026-08-26 19:36:39.706564+00', 'h3otj42wclsg', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 606, '4zhiokgul2rq', 'f50b752d-fd78-4409-aaca-ad36820124c8', true, '2026-09-04 11:34:44.291708+00', '2026-09-04 12:33:01.512771+00', 'ezl775ynd6df', '1038acf1-1212-42f5-9676-fc1ea5f7b923'),
	('00000000-0000-0000-0000-000000000000', 609, 'oam4l5iudkwa', 'f50b752d-fd78-4409-aaca-ad36820124c8', true, '2026-09-04 12:33:01.523795+00', '2026-09-04 13:31:24.542209+00', '4zhiokgul2rq', '1038acf1-1212-42f5-9676-fc1ea5f7b923'),
	('00000000-0000-0000-0000-000000000000', 452, 'zwuwbjnmy55c', '22ebb927-6ee6-44fd-8cb6-20fe159758b1', true, '2026-08-27 11:38:46.74825+00', '2026-08-27 12:49:54.580991+00', NULL, '6b35f415-d5b8-4119-8e3d-1abc85a84587'),
	('00000000-0000-0000-0000-000000000000', 391, 'yvjjbbnmhiqo', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-08-24 15:15:50.421937+00', '2026-08-25 20:15:22.830331+00', 'csghsfz7mutj', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 454, 'e6os2qj7pfkg', '22ebb927-6ee6-44fd-8cb6-20fe159758b1', true, '2026-08-27 12:49:54.587488+00', '2026-08-27 14:01:49.300444+00', 'zwuwbjnmy55c', '6b35f415-d5b8-4119-8e3d-1abc85a84587'),
	('00000000-0000-0000-0000-000000000000', 421, 'h3otj42wclsg', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-08-25 20:15:22.842077+00', '2026-08-25 22:53:30.629354+00', 'yvjjbbnmhiqo', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 457, 'pyzix35em6yl', '22ebb927-6ee6-44fd-8cb6-20fe159758b1', true, '2026-08-27 14:01:49.31088+00', '2026-08-27 15:51:02.904806+00', 'e6os2qj7pfkg', '6b35f415-d5b8-4119-8e3d-1abc85a84587'),
	('00000000-0000-0000-0000-000000000000', 464, 'fn3j4ahkuhfs', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', true, '2026-08-27 17:27:13.022412+00', '2026-08-27 18:26:21.856842+00', NULL, '92827c6c-2abb-4709-89c1-21dcbb0ba1e4'),
	('00000000-0000-0000-0000-000000000000', 461, 'qm5rtkgnkvua', '22ebb927-6ee6-44fd-8cb6-20fe159758b1', true, '2026-08-27 15:51:02.914441+00', '2026-08-27 19:53:05.592236+00', 'pyzix35em6yl', '6b35f415-d5b8-4119-8e3d-1abc85a84587'),
	('00000000-0000-0000-0000-000000000000', 446, 'dzvp4vxwog7u', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-08-26 19:36:39.728677+00', '2026-08-28 17:26:09.17137+00', '2u4ppmvc3oao', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 476, 'ja7cf2p5yt7u', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', true, '2026-08-27 23:21:21.798474+00', '2026-09-03 11:30:45.126272+00', 'yh3ysjy3ysrq', '92827c6c-2abb-4709-89c1-21dcbb0ba1e4'),
	('00000000-0000-0000-0000-000000000000', 624, 'wgnidypnslrh', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', true, '2026-09-08 15:28:06.056902+00', '2026-09-08 16:26:41.571546+00', NULL, '13cde8c2-80d9-474e-aebc-f2c1638b33d0'),
	('00000000-0000-0000-0000-000000000000', 627, 'kskhzyowicce', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', false, '2026-09-08 17:05:43.045548+00', '2026-09-08 17:05:43.045548+00', 'jrxeimq6xybi', 'bfc56816-be28-4da7-bc68-cce9ea3811d1'),
	('00000000-0000-0000-0000-000000000000', 467, 'agzdb4o3kz7j', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', true, '2026-08-27 18:26:21.866021+00', '2026-08-27 19:25:21.716678+00', 'fn3j4ahkuhfs', '92827c6c-2abb-4709-89c1-21dcbb0ba1e4'),
	('00000000-0000-0000-0000-000000000000', 512, 'hqseuv3nhzf5', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-08-30 23:29:57.997628+00', '2026-09-01 17:25:14.60747+00', 'hall4gkjmt3o', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 469, 'y4xecdab452w', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', true, '2026-08-27 19:25:21.727364+00', '2026-08-27 20:24:21.821848+00', 'agzdb4o3kz7j', '92827c6c-2abb-4709-89c1-21dcbb0ba1e4'),
	('00000000-0000-0000-0000-000000000000', 472, 'shhagl3muc57', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', true, '2026-08-27 20:24:21.835271+00', '2026-08-27 21:23:21.766801+00', 'y4xecdab452w', '92827c6c-2abb-4709-89c1-21dcbb0ba1e4'),
	('00000000-0000-0000-0000-000000000000', 474, '4itcfj7ypvmj', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', true, '2026-08-27 21:23:21.781238+00', '2026-08-27 22:22:21.854424+00', 'shhagl3muc57', '92827c6c-2abb-4709-89c1-21dcbb0ba1e4'),
	('00000000-0000-0000-0000-000000000000', 499, 'biz3bfgm4mz2', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-08-28 18:44:44.617664+00', '2026-08-30 20:07:27.221109+00', 'pnolqajfkvq7', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 475, 'yh3ysjy3ysrq', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', true, '2026-08-27 22:22:21.868204+00', '2026-08-27 23:21:21.787885+00', '4itcfj7ypvmj', '92827c6c-2abb-4709-89c1-21dcbb0ba1e4'),
	('00000000-0000-0000-0000-000000000000', 511, 'hall4gkjmt3o', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-08-30 20:07:27.237995+00', '2026-08-30 23:29:57.989766+00', 'biz3bfgm4mz2', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 579, 'ijcm3gq7qkpc', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-09-03 14:10:48.669594+00', '2026-09-03 16:42:37.09929+00', 'sgjurhbd6c3g', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 557, 'dyusrale2rku', 'f50b752d-fd78-4409-aaca-ad36820124c8', true, '2026-09-02 12:43:45.924956+00', '2026-09-02 13:50:43.486942+00', '45fx5degjjrf', '1038acf1-1212-42f5-9676-fc1ea5f7b923'),
	('00000000-0000-0000-0000-000000000000', 514, 'xs5zvlub3f7i', 'f761c53c-68c7-4c52-aa82-41d6bea038b1', true, '2026-08-31 12:27:34.061271+00', '2026-09-03 17:06:23.120165+00', 'uflretinxcqm', '47ce6821-1e08-4299-ac6d-00e0dafd92c3'),
	('00000000-0000-0000-0000-000000000000', 546, 'jov2z5kjhy6e', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-09-01 17:25:14.624326+00', '2026-09-02 14:56:47.008567+00', 'hqseuv3nhzf5', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 495, 'uflretinxcqm', 'f761c53c-68c7-4c52-aa82-41d6bea038b1', true, '2026-08-28 17:39:37.56378+00', '2026-08-31 12:27:34.047275+00', NULL, '47ce6821-1e08-4299-ac6d-00e0dafd92c3'),
	('00000000-0000-0000-0000-000000000000', 592, '44qrwmqyqleo', '1faf3776-3fca-4cf8-8489-dce99a888e06', true, '2026-09-03 17:07:18.802625+00', '2026-09-03 18:07:18.701636+00', 'wsrgrg5wa5th', '09b421f0-2e25-4c25-a5bc-a864e3ff77f2'),
	('00000000-0000-0000-0000-000000000000', 588, 'g7gta7ule5pm', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-09-03 16:42:37.117148+00', '2026-09-03 18:56:48.211803+00', 'ijcm3gq7qkpc', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 595, 'ix44z4jmpiio', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', true, '2026-09-03 17:55:22.680229+00', '2026-09-03 19:19:37.757294+00', 'hj6larbrkzev', 'db6c4173-5b26-4c03-863e-8682fbc50a6f'),
	('00000000-0000-0000-0000-000000000000', 598, 'vj3aouly35ui', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-09-03 18:56:48.216592+00', '2026-09-03 19:59:36.039244+00', 'g7gta7ule5pm', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 471, 'vfj2b3wryzam', '22ebb927-6ee6-44fd-8cb6-20fe159758b1', true, '2026-08-27 19:53:05.600716+00', '2026-08-31 16:20:54.777383+00', 'qm5rtkgnkvua', '6b35f415-d5b8-4119-8e3d-1abc85a84587'),
	('00000000-0000-0000-0000-000000000000', 591, '2ca33aew7dod', 'f761c53c-68c7-4c52-aa82-41d6bea038b1', true, '2026-09-03 17:06:23.1279+00', '2026-09-04 11:36:41.034563+00', 'xs5zvlub3f7i', '47ce6821-1e08-4299-ac6d-00e0dafd92c3'),
	('00000000-0000-0000-0000-000000000000', 607, 'youmfrfefxt7', 'f761c53c-68c7-4c52-aa82-41d6bea038b1', false, '2026-09-04 11:36:41.04148+00', '2026-09-04 11:36:41.04148+00', '2ca33aew7dod', '47ce6821-1e08-4299-ac6d-00e0dafd92c3'),
	('00000000-0000-0000-0000-000000000000', 604, 'ncyezn6g5pnv', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-09-04 00:34:40.981353+00', '2026-09-04 14:52:57.812086+00', 'gxk7nzqsxsef', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 613, '6ck7k44duumb', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-09-04 14:52:57.831202+00', '2026-09-04 18:18:36.343548+00', 'ncyezn6g5pnv', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 494, 'pnolqajfkvq7', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-08-28 17:26:09.179069+00', '2026-08-28 18:44:44.60754+00', 'dzvp4vxwog7u', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 498, 'qcwx67rrihog', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', true, '2026-08-28 18:27:39.724687+00', '2026-08-28 19:26:28.147223+00', NULL, '20a12d0e-b95a-423b-8938-de73c0f7ebbe'),
	('00000000-0000-0000-0000-000000000000', 501, 'rnl3hcdn3qnl', 'ccad1568-f55e-4d05-9cb4-de650cd313a4', false, '2026-08-28 19:26:28.152332+00', '2026-08-28 19:26:28.152332+00', 'qcwx67rrihog', '20a12d0e-b95a-423b-8938-de73c0f7ebbe'),
	('00000000-0000-0000-0000-000000000000', 622, 'ukzyk6p6nbvu', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', true, '2026-09-08 14:48:19.320971+00', '2026-09-08 16:01:34.145648+00', NULL, 'bfc56816-be28-4da7-bc68-cce9ea3811d1'),
	('00000000-0000-0000-0000-000000000000', 568, 'xgwz7jj46ejb', 'f50b752d-fd78-4409-aaca-ad36820124c8', true, '2026-09-03 11:19:14.56212+00', '2026-09-03 12:17:48.688112+00', '4mbg2nysfqtu', '1038acf1-1212-42f5-9676-fc1ea5f7b923'),
	('00000000-0000-0000-0000-000000000000', 571, '4lq53at5wlye', '1faf3776-3fca-4cf8-8489-dce99a888e06', true, '2026-09-03 12:07:10.095076+00', '2026-09-03 13:07:19.142664+00', NULL, '09b421f0-2e25-4c25-a5bc-a864e3ff77f2'),
	('00000000-0000-0000-0000-000000000000', 625, 'jrxeimq6xybi', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', true, '2026-09-08 16:01:34.158684+00', '2026-09-08 17:05:43.02941+00', 'ukzyk6p6nbvu', 'bfc56816-be28-4da7-bc68-cce9ea3811d1'),
	('00000000-0000-0000-0000-000000000000', 574, 'hwxydrrgn4ww', '1faf3776-3fca-4cf8-8489-dce99a888e06', true, '2026-09-03 13:07:19.153608+00', '2026-09-03 14:07:18.77748+00', '4lq53at5wlye', '09b421f0-2e25-4c25-a5bc-a864e3ff77f2'),
	('00000000-0000-0000-0000-000000000000', 561, 'sgjurhbd6c3g', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-09-02 14:56:47.023188+00', '2026-09-03 14:10:48.658359+00', 'jov2z5kjhy6e', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 580, 'nbcitfpb74rr', 'f50b752d-fd78-4409-aaca-ad36820124c8', true, '2026-09-03 14:23:02.326099+00', '2026-09-03 15:55:34.757938+00', '6mcqfxu22smv', '1038acf1-1212-42f5-9676-fc1ea5f7b923'),
	('00000000-0000-0000-0000-000000000000', 522, 'dq7unffsg7dz', '22ebb927-6ee6-44fd-8cb6-20fe159758b1', true, '2026-08-31 16:20:54.792432+00', '2026-08-31 17:19:54.324285+00', 'vfj2b3wryzam', '6b35f415-d5b8-4119-8e3d-1abc85a84587'),
	('00000000-0000-0000-0000-000000000000', 555, '45fx5degjjrf', 'f50b752d-fd78-4409-aaca-ad36820124c8', true, '2026-09-02 11:45:06.894388+00', '2026-09-02 12:43:45.905717+00', NULL, '1038acf1-1212-42f5-9676-fc1ea5f7b923'),
	('00000000-0000-0000-0000-000000000000', 583, 'oecgrzkepktq', '1faf3776-3fca-4cf8-8489-dce99a888e06', true, '2026-09-03 15:07:19.012356+00', '2026-09-03 16:07:18.944928+00', '7ssl6kkqlfaw', '09b421f0-2e25-4c25-a5bc-a864e3ff77f2'),
	('00000000-0000-0000-0000-000000000000', 525, '22a4k2jbs7qp', '22ebb927-6ee6-44fd-8cb6-20fe159758b1', true, '2026-08-31 17:19:54.333102+00', '2026-08-31 19:00:40.241189+00', 'dq7unffsg7dz', '6b35f415-d5b8-4119-8e3d-1abc85a84587'),
	('00000000-0000-0000-0000-000000000000', 530, 'es6uv2cusxd4', '22ebb927-6ee6-44fd-8cb6-20fe159758b1', false, '2026-08-31 19:00:40.249945+00', '2026-08-31 19:00:40.249945+00', '22a4k2jbs7qp', '6b35f415-d5b8-4119-8e3d-1abc85a84587'),
	('00000000-0000-0000-0000-000000000000', 596, 'mmjfuzlghgrm', '1faf3776-3fca-4cf8-8489-dce99a888e06', true, '2026-09-03 18:07:18.711262+00', '2026-09-03 19:07:18.778045+00', '44qrwmqyqleo', '09b421f0-2e25-4c25-a5bc-a864e3ff77f2'),
	('00000000-0000-0000-0000-000000000000', 599, 'ow4xzbxzbwnk', '1faf3776-3fca-4cf8-8489-dce99a888e06', false, '2026-09-03 19:07:18.788415+00', '2026-09-03 19:07:18.788415+00', 'mmjfuzlghgrm', '09b421f0-2e25-4c25-a5bc-a864e3ff77f2'),
	('00000000-0000-0000-0000-000000000000', 602, 'gxk7nzqsxsef', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', true, '2026-09-03 19:59:36.048081+00', '2026-09-04 00:34:40.963399+00', 'vj3aouly35ui', 'd8bac4f3-d303-4702-bbb7-da427a9a6868'),
	('00000000-0000-0000-0000-000000000000', 586, 'ezl775ynd6df', 'f50b752d-fd78-4409-aaca-ad36820124c8', true, '2026-09-03 15:55:34.763684+00', '2026-09-04 11:34:44.284948+00', 'nbcitfpb74rr', '1038acf1-1212-42f5-9676-fc1ea5f7b923'),
	('00000000-0000-0000-0000-000000000000', 611, 'hwua5gw42dc2', 'f50b752d-fd78-4409-aaca-ad36820124c8', false, '2026-09-04 13:31:24.554611+00', '2026-09-04 13:31:24.554611+00', 'oam4l5iudkwa', '1038acf1-1212-42f5-9676-fc1ea5f7b923'),
	('00000000-0000-0000-0000-000000000000', 618, 'cpd3oscjb2yv', 'dc3b83dd-f51d-45a9-a138-6bcffd255071', false, '2026-09-04 18:18:36.348105+00', '2026-09-04 18:18:36.348105+00', '6ck7k44duumb', 'd8bac4f3-d303-4702-bbb7-da427a9a6868');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 627, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict QPEGvntL6yLfBONQxfPsBDSLxXiaKNgaRa7LhxdNRICgzQq98wQlekYGTN7718s

RESET ALL;
