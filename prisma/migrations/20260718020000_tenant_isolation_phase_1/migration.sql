ALTER TABLE "modifier_groups" ADD COLUMN "organization_id" UUID;

UPDATE "modifier_groups" AS mg
SET "organization_id" = owned."organization_id"
FROM (
  SELECT DISTINCT ON (links."modifier_group_id")
    links."modifier_group_id",
    brands."organization_id"
  FROM "menu_item_modifier_groups" AS links
  JOIN "menu_items" AS items ON items."id" = links."menu_item_id"
  JOIN "menu_categories" AS categories ON categories."id" = items."category_id"
  JOIN "menus" AS menus ON menus."id" = categories."menu_id"
  JOIN "brands" AS brands ON brands."id" = menus."brand_id"
  ORDER BY links."modifier_group_id"
) AS owned
WHERE mg."id" = owned."modifier_group_id";

ALTER TABLE "modifier_groups"
ADD CONSTRAINT "modifier_groups_organization_id_fkey"
FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
