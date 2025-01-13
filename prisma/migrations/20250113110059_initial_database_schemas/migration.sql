-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "verified" BOOLEAN DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainTrack" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "domainName" TEXT NOT NULL,
    "dataforseo_taskId" TEXT,

    CONSTRAINT "DomainTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainInfo" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "domainTrackId" TEXT NOT NULL,
    "crawl_progress" TEXT,
    "total_pages" INTEGER,
    "ip" TEXT,
    "server" TEXT,
    "ssl" BOOLEAN,
    "ssl_certificate_expiration_date" TIMESTAMP(3),
    "links_external" INTEGER,
    "links_internal" INTEGER,
    "duplicate_title" INTEGER,
    "duplicate_description" INTEGER,
    "duplicate_content" INTEGER,
    "broken_links" INTEGER,
    "duplicate_meta_tags" INTEGER,
    "no_description" INTEGER,
    "seo_friendly_url" INTEGER,
    "seo_friendly_url_characters_check" INTEGER,
    "seo_friendly_url_dynamic_check" INTEGER,
    "seo_friendly_url_keywords_check" INTEGER,
    "seo_friendly_url_relative_length_check" INTEGER,

    CONSTRAINT "DomainInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DomainInfo_domainTrackId_key" ON "DomainInfo"("domainTrackId");

-- AddForeignKey
ALTER TABLE "DomainTrack" ADD CONSTRAINT "DomainTrack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainInfo" ADD CONSTRAINT "DomainInfo_domainTrackId_fkey" FOREIGN KEY ("domainTrackId") REFERENCES "DomainTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
