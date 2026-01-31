-- DropForeignKey
ALTER TABLE "HallBookingItem" DROP CONSTRAINT "HallBookingItem_menuItemId_fkey";

-- AlterTable
ALTER TABLE "HallBooking" ADD COLUMN     "guestCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "HallBookingItem" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "menuItemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "HallBookingItem" ADD CONSTRAINT "HallBookingItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
