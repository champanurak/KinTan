"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import AppShell from "@/components/layout/app-shell";

const partners = [
  {
    name: "Lotus's",
    short: "LT",
    logoUrl: "/partners/lotuss.png",
    websiteUrl: "https://www.lotuss.com",
    logoClass: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  },
  {
    name: "Big C",
    short: "BC",
    logoUrl: "/partners/bigc.png",
    websiteUrl: "https://www.bigc.co.th",
    logoClass: "bg-red-100 text-red-700 ring-red-200",
  },
  {
    name: "Tops",
    short: "TP",
    logoUrl: "/partners/tops.png",
    websiteUrl: "https://www.tops.co.th",
    logoClass: "bg-blue-100 text-blue-700 ring-blue-200",
  },
  {
    name: "Makro",
    short: "MK",
    logoUrl: "/partners/makro.ico",
    websiteUrl: "https://www.siammakro.co.th",
    logoClass: "bg-sky-100 text-sky-700 ring-sky-200",
  },
  {
    name: "CJ More",
    short: "CJ",
    logoUrl: "/partners/cjmore.png",
    websiteUrl: "https://www.cjexpress.co.th",
    logoClass: "bg-amber-100 text-amber-700 ring-amber-200",
  },
  {
    name: "7-Eleven",
    short: "7E",
    logoUrl: "/partners/7eleven.png",
    websiteUrl: "https://www.7eleven.co.th",
    logoClass: "bg-lime-100 text-lime-700 ring-lime-200",
  },
];

export default function PartnersPage() {
  const [brokenLogos, setBrokenLogos] = useState<Record<string, boolean>>({});
  const brokenSet = useMemo(() => brokenLogos, [brokenLogos]);

  return (
    <AppShell title="ร้านค้าพาร์ทเนอร์" subtitle="ค้นหาร้านค้าและโปรโมชั่นที่เชื่อมกับ Kin-Tan">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {partners.map((shop) => (
          <article key={shop.name} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {brokenSet[shop.name] ? (
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ring-1 ${shop.logoClass}`}>
                    {shop.short}
                  </span>
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <Image
                      src={shop.logoUrl}
                      alt={`${shop.name} logo`}
                      width={28}
                      height={28}
                      className="h-7 w-7 object-contain"
                      onError={() =>
                        setBrokenLogos((prev) => ({
                          ...prev,
                          [shop.name]: true,
                        }))
                      }
                    />
                  </span>
                )}
                <h2 className="text-lg font-semibold text-slate-900">{shop.name}</h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">พาร์ทเนอร์</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">โปรโมชันวัตถุดิบที่ใช้บ่อยอัปเดตทุกวัน</p>
            <a
              href={shop.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-black"
            >
              ดูรายละเอียด
            </a>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
