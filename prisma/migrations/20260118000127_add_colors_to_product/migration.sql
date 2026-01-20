/*
  Warnings:

  - You are about to drop the column `tags` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `variant` table. All the data in the column will be lost.
  - Added the required column `price` to the `variant` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "variant_sku_key";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "tags",
ADD COLUMN     "colors" TEXT[];

-- AlterTable
ALTER TABLE "variant" DROP COLUMN "sku",
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_key" ON "tag"("name");

-- CreateIndex
CREATE INDEX "_ProductTags_B_index" ON "_ProductTags"("B");

-- AddForeignKey
ALTER TABLE "_ProductTags" ADD CONSTRAINT "_ProductTags_A_fkey" FOREIGN KEY ("A") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductTags" ADD CONSTRAINT "_ProductTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
