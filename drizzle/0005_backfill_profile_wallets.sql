-- Every account has at least one card (wallet). New accounts get one at sign-up;
-- this gives one to profiles created before that rule.
INSERT INTO "wallets" ("owner_type", "owner_id")
SELECT 'profile', p."id"
FROM "profiles" p
WHERE NOT EXISTS (
  SELECT 1 FROM "wallets" w WHERE w."owner_type" = 'profile' AND w."owner_id" = p."id"
);
