SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict IebaOl0tpqAPiyWX0eq1m2xBwUMv4mEyClQHlCu7XMMa1igXab8AgyoE3RqA0pA

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
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type", "versioning_status") VALUES
	('evidencias', 'evidencias', NULL, '2026-07-07 15:37:50.15907+00', '2026-07-07 15:37:50.15907+00', true, false, NULL, NULL, NULL, 'STANDARD', 'DISABLED')
ON CONFLICT (id) DO NOTHING;


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "archived_at", "is_delete_marker", "is_versioned") VALUES
	('6cf87c22-ca6b-4775-b3c7-11e33da00f9d', 'evidencias', '1783515769989_f5dtpm.jpeg', 'a57b166d-a4ed-4b1a-aeea-370f1b640ed4', '2026-07-08 13:02:48.126558+00', '2026-07-08 13:02:48.126558+00', '2026-07-08 13:02:48.126558+00', '{"eTag": "\"c24b45246af2d281901a27fc8e88fab4\"", "size": 43056, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-08T13:02:49.000Z", "contentLength": 43056, "httpStatusCode": 200}', '4c528206-def6-4ff8-bcee-b4f971fac0d2', 'a57b166d-a4ed-4b1a-aeea-370f1b640ed4', '{}', NULL, false, false),
	('1c1febd6-0603-47c4-9309-efac6d80c997', 'evidencias', '1783613666300_knjba.PDF', '1784d5ee-e6ec-4094-9e6f-b3cf430038a0', '2026-07-09 16:14:30.911102+00', '2026-07-09 16:14:30.911102+00', '2026-07-09 16:14:30.911102+00', '{"eTag": "\"a5f9aca149be707daae5e61123b45204\"", "size": 78813, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-07-09T16:14:31.000Z", "contentLength": 78813, "httpStatusCode": 200}', '13e50c6c-5f94-4396-9881-77248ace7fd7', '1784d5ee-e6ec-4094-9e6f-b3cf430038a0', '{}', NULL, false, false),
	('e381341d-0fc0-4ccb-b4df-d67ac7be1a30', 'evidencias', '1783694774591_58yq2l.jpeg', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-10 14:46:17.433033+00', '2026-07-10 14:46:17.433033+00', '2026-07-10 14:46:17.433033+00', '{"eTag": "\"164d0fd21a8ea5314751d0de7d0db4bc\"", "size": 144830, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-10T14:46:18.000Z", "contentLength": 144830, "httpStatusCode": 200}', '4b945c43-5a2f-43e3-b18f-f83c437380f9', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('e2441d1b-fbf1-441d-a765-2f302ada1918', 'evidencias', '1783960792800_nuwd6.jpeg', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 16:39:58.487717+00', '2026-07-13 16:39:58.487717+00', '2026-07-13 16:39:58.487717+00', '{"eTag": "\"164d0fd21a8ea5314751d0de7d0db4bc\"", "size": 144830, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T16:39:59.000Z", "contentLength": 144830, "httpStatusCode": 200}', '6a4bc8a5-44f0-4691-9a5d-6e69a1bead3a', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('f9cd0804-1bbc-4d52-867a-196a336354e6', 'evidencias', '1783960800010_jlkegt.jpeg', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 16:40:05.434886+00', '2026-07-13 16:40:05.434886+00', '2026-07-13 16:40:05.434886+00', '{"eTag": "\"164d0fd21a8ea5314751d0de7d0db4bc\"", "size": 144830, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T16:40:06.000Z", "contentLength": 144830, "httpStatusCode": 200}', '0acca17d-707f-4268-98c2-c21716f18520', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('3a01377d-c776-42d7-95f9-c729b0a56953', 'evidencias', '1783961158051_ifrpiw.webp', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 16:45:58.165895+00', '2026-07-13 16:45:58.165895+00', '2026-07-13 16:45:58.165895+00', '{"eTag": "\"9cfa1e9f253a1507b73cfd987e1241d6\"", "size": 133252, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T16:45:59.000Z", "contentLength": 133252, "httpStatusCode": 200}', '5a034427-4307-4d07-adff-aa2f94042f94', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('caa964f2-8676-4f17-83ea-703bb7e4a90e', 'evidencias', '1783961271701_rl7mxf.webp', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 16:47:52.292405+00', '2026-07-13 16:47:52.292405+00', '2026-07-13 16:47:52.292405+00', '{"eTag": "\"9cfa1e9f253a1507b73cfd987e1241d6\"", "size": 133252, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T16:47:53.000Z", "contentLength": 133252, "httpStatusCode": 200}', '704efcad-52fe-4fa2-8e34-a1a2a1bd7eb9', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('265ab109-e58f-4b34-a2a4-a3e277b83a59', 'evidencias', '1783961306192_0be2y.webp', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 16:48:26.253568+00', '2026-07-13 16:48:26.253568+00', '2026-07-13 16:48:26.253568+00', '{"eTag": "\"9cfa1e9f253a1507b73cfd987e1241d6\"", "size": 133252, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T16:48:27.000Z", "contentLength": 133252, "httpStatusCode": 200}', 'a865be5c-ad44-4ed1-b471-46ab7b08f9f5', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('0b1c3fb3-cb98-4f32-9914-d6652be43b26', 'evidencias', '1783961453253_qtx2r8.webp', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 16:50:53.383257+00', '2026-07-13 16:50:53.383257+00', '2026-07-13 16:50:53.383257+00', '{"eTag": "\"9cfa1e9f253a1507b73cfd987e1241d6\"", "size": 133252, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T16:50:54.000Z", "contentLength": 133252, "httpStatusCode": 200}', 'c774967a-28a5-498e-bbf3-8c7e8986c4a8', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('b0319c26-b059-4595-b165-624e733a80df', 'evidencias', '1783961607536_iddlnf.webp', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 16:53:27.605551+00', '2026-07-13 16:53:27.605551+00', '2026-07-13 16:53:27.605551+00', '{"eTag": "\"9cfa1e9f253a1507b73cfd987e1241d6\"", "size": 133252, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T16:53:28.000Z", "contentLength": 133252, "httpStatusCode": 200}', 'd79686ce-a0a1-4af8-bf66-9ece22f4a6e8', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('62ff18b1-a8b9-4ea2-944c-66a2c0b52831', 'evidencias', '1783961937012_z3xzut.jpeg', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 16:59:03.009561+00', '2026-07-13 16:59:03.009561+00', '2026-07-13 16:59:03.009561+00', '{"eTag": "\"164d0fd21a8ea5314751d0de7d0db4bc\"", "size": 144830, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T16:59:03.000Z", "contentLength": 144830, "httpStatusCode": 200}', 'eaee9cf7-e833-46d8-8343-4071c3e73a52', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('008f6d07-31bf-46ed-a452-f7a6311db89f', 'evidencias', '1783962006324_7v94u.webp', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 17:00:06.7944+00', '2026-07-13 17:00:06.7944+00', '2026-07-13 17:00:06.7944+00', '{"eTag": "\"9cfa1e9f253a1507b73cfd987e1241d6\"", "size": 133252, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T17:00:07.000Z", "contentLength": 133252, "httpStatusCode": 200}', '789e966c-c69d-4e4b-bf3a-c2f36d78845d', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('edd1dfd8-b2d1-4077-b48e-8994496e6617', 'evidencias', '1783962063512_znlnx.webp', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 17:01:03.976261+00', '2026-07-13 17:01:03.976261+00', '2026-07-13 17:01:03.976261+00', '{"eTag": "\"9cfa1e9f253a1507b73cfd987e1241d6\"", "size": 133252, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T17:01:04.000Z", "contentLength": 133252, "httpStatusCode": 200}', 'e07992a6-6ed3-42af-9cf6-66f9341c89e1', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('5b3aafad-e25d-4c09-bc4b-3d9fde4a1609', 'evidencias', '1783962159955_7p9ia.webp', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 17:02:40.163669+00', '2026-07-13 17:02:40.163669+00', '2026-07-13 17:02:40.163669+00', '{"eTag": "\"9cfa1e9f253a1507b73cfd987e1241d6\"", "size": 133252, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T17:02:41.000Z", "contentLength": 133252, "httpStatusCode": 200}', 'e68953de-41b3-4eb7-b505-d935aaef5076', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('4fe82f24-0e47-4e4f-ba50-529f237ae6db', 'evidencias', '1783962219936_dr4pff.webp', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 17:03:40.004743+00', '2026-07-13 17:03:40.004743+00', '2026-07-13 17:03:40.004743+00', '{"eTag": "\"9cfa1e9f253a1507b73cfd987e1241d6\"", "size": 133252, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T17:03:40.000Z", "contentLength": 133252, "httpStatusCode": 200}', 'd9b8bf35-dc8f-44c9-a942-b15cc90c8b72', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('4574293b-3a30-44c1-98fc-6dee420d7992', 'evidencias', '1783962251154_2pyrar.webp', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 17:04:11.156297+00', '2026-07-13 17:04:11.156297+00', '2026-07-13 17:04:11.156297+00', '{"eTag": "\"9cfa1e9f253a1507b73cfd987e1241d6\"", "size": 133252, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T17:04:12.000Z", "contentLength": 133252, "httpStatusCode": 200}', '44d897a2-c424-4faf-a5b0-a26b88349798', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('469de558-0a5c-4c81-b124-84ed2dd9edae', 'evidencias', '1783967908034_t0eakd.jpeg', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-13 18:38:33.94935+00', '2026-07-13 18:38:33.94935+00', '2026-07-13 18:38:33.94935+00', '{"eTag": "\"164d0fd21a8ea5314751d0de7d0db4bc\"", "size": 144830, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-13T18:38:34.000Z", "contentLength": 144830, "httpStatusCode": 200}', '4c452e83-a33a-45d7-9ca6-38a4c8513077', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('97df8fb4-778e-4b46-a245-d59ae7bf4a48', 'evidencias', '1784032016301_m5dlv.png', 'f50b752d-fd78-4409-aaca-ad36820124c8', '2026-07-14 12:26:56.757684+00', '2026-07-14 12:26:56.757684+00', '2026-07-14 12:26:56.757684+00', '{"eTag": "\"e6cb9c320f972d694839fe05984b1d07\"", "size": 107668, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-14T12:26:57.000Z", "contentLength": 107668, "httpStatusCode": 200}', '22b788e1-0a75-4802-86d8-4addf3db3112', 'f50b752d-fd78-4409-aaca-ad36820124c8', '{}', NULL, false, false),
	('906890fb-1d32-4cee-a322-fb48ad9f49b2', 'evidencias', '1784900511568_99rav1.PNG', 'f761c53c-68c7-4c52-aa82-41d6bea038b1', '2026-07-24 13:41:53.003555+00', '2026-07-24 13:41:53.003555+00', '2026-07-24 13:41:53.003555+00', '{"eTag": "\"98edcc8c6073ed8b07e0c1ee27454e8f\"", "size": 32267, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-24T13:41:53.000Z", "contentLength": 32267, "httpStatusCode": 200}', 'a926ea3b-5e29-4871-977a-410fe0b0975a', 'f761c53c-68c7-4c52-aa82-41d6bea038b1', '{}', NULL, false, false),
	('a99babd3-24e2-470d-8398-c6d7e03dd10c', 'evidencias', '1785280913909_upab6b.PNG', 'f761c53c-68c7-4c52-aa82-41d6bea038b1', '2026-07-28 23:21:56.118239+00', '2026-07-28 23:21:56.118239+00', '2026-07-28 23:21:56.118239+00', '{"eTag": "\"02fccb05145b12a39e74cf46c43e5bc2\"", "size": 87283, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-28T23:21:57.000Z", "contentLength": 87283, "httpStatusCode": 200}', '451694be-1713-428e-9a2d-efa671c78986', 'f761c53c-68c7-4c52-aa82-41d6bea038b1', '{}', NULL, false, false),
	('dbf25de0-86ce-4990-b6c0-08821104295c', 'evidencias', '1785336452368_rgmuc6.jpg', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '2026-07-29 14:47:33.509772+00', '2026-07-29 14:47:33.509772+00', '2026-07-29 14:47:33.509772+00', '{"eTag": "\"33fa3067c560f6c3c512a7b3365e9dca\"", "size": 51646, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-29T14:47:34.000Z", "contentLength": 51646, "httpStatusCode": 200}', '3976febb-2af1-436c-88c2-35bd9b0e5c30', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '{}', NULL, false, false),
	('cc9dead6-4ffe-4b73-aa89-06a8d10fd4df', 'evidencias', '1785766730612_ccyzpr.jpg', '1faf3776-3fca-4cf8-8489-dce99a888e06', '2026-08-03 14:18:54.367681+00', '2026-08-03 14:18:54.367681+00', '2026-08-03 14:18:54.367681+00', '{"eTag": "\"e9610b713d994b495929b71c63f68459\"", "size": 5752760, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-03T14:18:55.000Z", "contentLength": 5752760, "httpStatusCode": 200}', 'ea27e0fa-1c82-40ca-af57-145d40897c0a', '1faf3776-3fca-4cf8-8489-dce99a888e06', '{}', NULL, false, false),
	('9b71b3b4-9324-447e-9bbd-da9c2d33c540', 'evidencias', '1785766734445_z7ifrr.jpg', '1faf3776-3fca-4cf8-8489-dce99a888e06', '2026-08-03 14:18:56.911642+00', '2026-08-03 14:18:56.911642+00', '2026-08-03 14:18:56.911642+00', '{"eTag": "\"e1372b1b8caa68484046b2847511fa0d\"", "size": 5862160, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-03T14:18:57.000Z", "contentLength": 5862160, "httpStatusCode": 200}', '3a140a52-857a-4903-af8b-620d9db4f32b', '1faf3776-3fca-4cf8-8489-dce99a888e06', '{}', NULL, false, false),
	('c58a0266-404f-4310-803d-eaae8e90d096', 'evidencias', '1785766736987_o58dl.jpg', '1faf3776-3fca-4cf8-8489-dce99a888e06', '2026-08-03 14:18:59.615437+00', '2026-08-03 14:18:59.615437+00', '2026-08-03 14:18:59.615437+00', '{"eTag": "\"e8c40279ca8c9e279fe2cc41795dcea0\"", "size": 6259902, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-03T14:19:00.000Z", "contentLength": 6259902, "httpStatusCode": 200}', '1c8c1cb8-491a-42c9-85ea-ac1930eacd8e', '1faf3776-3fca-4cf8-8489-dce99a888e06', '{}', NULL, false, false),
	('98f2c945-f742-4943-8ea6-07a56d58d51c', 'evidencias', '1785766739827_9scmh8.jpg', '1faf3776-3fca-4cf8-8489-dce99a888e06', '2026-08-03 14:19:01.754963+00', '2026-08-03 14:19:01.754963+00', '2026-08-03 14:19:01.754963+00', '{"eTag": "\"c46b799582c9c05bce959993a5cd2a09\"", "size": 5116925, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-03T14:19:02.000Z", "contentLength": 5116925, "httpStatusCode": 200}', 'e5983492-41dc-45c7-8622-7fc1d03fbed1', '1faf3776-3fca-4cf8-8489-dce99a888e06', '{}', NULL, false, false),
	('7d8fb0aa-2d1c-4857-b978-915d0de33e2e', 'evidencias', '1786561673876_qlonv.jpg', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '2026-08-12 19:07:55.540153+00', '2026-08-12 19:07:55.540153+00', '2026-08-12 19:07:55.540153+00', '{"eTag": "\"2f1a8e93d65f578be2d47a7a0ab7da4e\"", "size": 111813, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T19:07:56.000Z", "contentLength": 111813, "httpStatusCode": 200}', 'a58aea40-5d31-41d1-8a71-5c77c5cbb23b', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '{}', NULL, false, false),
	('9358b0af-faf2-4d4f-8cec-f195364e73fc', 'evidencias', '1786561674990_gx8rm.jpg', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '2026-08-12 19:07:55.990194+00', '2026-08-12 19:07:55.990194+00', '2026-08-12 19:07:55.990194+00', '{"eTag": "\"2abf6b95eca18c3db46b2bff0a980d57\"", "size": 196363, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T19:07:56.000Z", "contentLength": 196363, "httpStatusCode": 200}', '87b7a516-d16f-4186-aea1-05006fda719b', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '{}', NULL, false, false),
	('e05ad848-cff3-4344-8016-4a2d15b42b72', 'evidencias', '1786564654631_7oyps8.pdf', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '2026-08-12 19:57:37.257635+00', '2026-08-12 19:57:37.257635+00', '2026-08-12 19:57:37.257635+00', '{"eTag": "\"c4e5bc8e289c77e7023275d13ffbd0c1\"", "size": 3919722, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T19:57:38.000Z", "contentLength": 3919722, "httpStatusCode": 200}', '7ec9db3e-417e-491e-a182-b5ce19cba5ec', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '{}', NULL, false, false),
	('2e210307-b0fa-41c8-91d9-3b9c8247a6d1', 'evidencias', '1786980226136_31ekd.xlsx', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '2026-08-17 15:23:46.628605+00', '2026-08-17 15:23:46.628605+00', '2026-08-17 15:23:46.628605+00', '{"eTag": "\"03789b6a4751d11a2859e899c8a6f8a0\"", "size": 11305, "mimetype": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "cacheControl": "max-age=3600", "lastModified": "2026-08-17T15:23:47.000Z", "contentLength": 11305, "httpStatusCode": 200}', 'fbdcb2a8-45a5-40f8-99d3-ace78ea2feee', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '{}', NULL, false, false),
	('45195f8e-37e8-46a9-8846-5d988e8e8953', 'evidencias', '1787058809970_r4l8wk.png', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '2026-08-18 13:13:31.670089+00', '2026-08-18 13:13:31.670089+00', '2026-08-18 13:13:31.670089+00', '{"eTag": "\"13bbafc29db1adf93e923f55ed9c11e4\"", "size": 98637, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-18T13:13:32.000Z", "contentLength": 98637, "httpStatusCode": 200}', 'f62f141c-4d07-406d-aaca-8bb3f286222b', 'a8b7d226-a0c1-4cca-acf0-c7aea267cce3', '{}', NULL, false, false),
	('96ec2613-6645-4488-917a-7f278d580806', 'evidencias', '1788455327803_8wl6dh.jpeg', 'f761c53c-68c7-4c52-aa82-41d6bea038b1', '2026-09-03 17:08:48.519336+00', '2026-09-03 17:08:48.519336+00', '2026-09-03 17:08:48.519336+00', '{"eTag": "\"c2df42796d2a3706016fc46c435b1525\"", "size": 113946, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-09-03T17:08:49.000Z", "contentLength": 113946, "httpStatusCode": 200}', '7acfa3e8-34b9-40d2-a4ef-9f42bd2b609a', 'f761c53c-68c7-4c52-aa82-41d6bea038b1', '{}', NULL, false, false)
ON CONFLICT (id) DO NOTHING;


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- PostgreSQL database dump complete
--

-- \unrestrict IebaOl0tpqAPiyWX0eq1m2xBwUMv4mEyClQHlCu7XMMa1igXab8AgyoE3RqA0pA

RESET ALL;
