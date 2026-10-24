import { Icon } from '@iconify/react'
import type { ReactNode } from 'react'
import { statusInfo } from '../../lib/status'

function Block({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-paper p-6">
      <h2 className="flex items-center gap-2.5 text-base font-semibold">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icon icon={icon} className="size-[18px]" aria-hidden />
        </span>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/85">{children}</div>
    </section>
  )
}

const code = 'rounded bg-canvas px-1 py-0.5 font-mono text-[13px]'

const STACK: [string, string][] = [
  ['React 19 + TypeScript', 'komponen fungsi dan hooks, mode strict'],
  ['TanStack Query', 'cache, refetch otomatis, retry'],
  ['Tailwind CSS v4', 'token warna dan font di satu berkas'],
  ['Leaflet + OpenStreetMap', 'peta bawaan, dimuat hanya saat dibutuhkan'],
  ['Google Maps (opsional)', 'dipilih lewat tombol di peta, skripnya baru dimuat saat dipilih'],
  ['Solar (Iconify)', 'ikon yang dibundel, tanpa panggilan ke luar'],
  ['Vitest + Testing Library', 'tes unit dan komponen'],
]

const STATUS_ROWS = (['IN_TRANSIT_TO', 'INCOMING_AT', 'STOPPED_AT'] as const).map((k) => [k, statusInfo(k).label] as const)

export default function DataInfoPage({ simulation }: { simulation?: { href: string; onOpen: () => void } }) {
  return (
    <div className="max-w-5xl">
      <p className="mb-4 text-sm text-ink-muted">
        Ringkasan dari mana angka di aplikasi ini datang dan kenapa ia dibuat seperti ini.
      </p>
      <div className="grid items-start gap-4 lg:grid-cols-2">

      <Block icon="solar:bus-linear" title="Sumber data">
        <p>
          Semua kendaraan, rute, trip, dan halte diambil langsung dari <strong>MBTA V3 API</strong> (api-v3.mbta.com),
          layanan angkutan umum Boston. Posisinya nyata dan berjalan saat ini, jadi jumlah dan lokasinya berubah dari menit ke menit.
          Tidak ada data contoh di dalam aplikasi.
        </p>
        <p>
          Daftar kendaraan diperbarui otomatis tiap <strong>30 detik</strong> selama tab terlihat. Pembaruan berhenti saat tab
          disembunyikan, dan bisa dimatikan lewat kotak &quot;Otomatis tiap 30 detik&quot; di bagian atas. Tombol &quot;Muat ulang&quot; mengambil data
          saat itu juga. Jam yang tertera memakai WIB.
        </p>
      </Block>

      <Block icon="solar:danger-triangle-linear" title="Batas permintaan">
        <p>
          Tanpa API key, MBTA hanya mengizinkan <strong>20 permintaan per menit</strong> per alamat IP. Untuk 1.000 per menit, daftarkan key gratis
          lalu isi <code className={code}>VITE_MBTA_API_KEY</code> di <code className={code}>.env.local</code>. Karena ini aplikasi frontend, key ikut
          masuk ke bundle dan terlihat publik.
        </p>
        <p>
          Kalau batas terlampaui, aplikasi menampilkan hitung mundur sampai menit berikutnya lalu mencoba lagi sendiri. Data terakhir tetap
          tampil selama itu.
        </p>
      </Block>

      <Block icon="solar:routing-2-linear" title="Cara kerja pagination">
        <p>
          API MBTA tidak mengirim jumlah total data, hanya tautan halaman pertama, berikutnya, dan terakhir. Karena seluruh armada kurang lebih 17 KB (gzip),
          aplikasi mengambil <strong>semua kendaraan sesuai filter dalam satu permintaan</strong>, lalu memotongnya per halaman di browser (5, 10, 20, atau 50 per halaman).
        </p>
        <p>
          Hasilnya: total selalu pasti, urutan stabil karena diurutkan menurut label, pindah halaman tidak memakai jatah 20 permintaan per menit,
          dan kendaraan tidak dobel atau terlewat ketika data bergeser di antara dua permintaan. Peta Armada memakai data yang sama, jadi
          membukanya tidak menambah permintaan selain gambar petanya.
        </p>
      </Block>

      <Block icon="solar:map-arrow-right-linear" title="Kenapa Trip butuh Rute">
        <p>
          Endpoint <code className={code}>/trips</code> menolak permintaan tanpa filter (kode 400, &quot;At least one filter[] is required&quot;), dan satu rute bisa punya
          sekitar 2.000 trip per hari. Karena itu pilihan Trip baru aktif setelah ada Rute. Trip yang sedang dilalui kendaraan ditaruh paling atas
          di grup &quot;Sedang berjalan&quot;, dan melepas sebuah rute ikut melepas trip miliknya.
        </p>
      </Block>

      <Block icon="solar:stop-circle-linear" title="Arti status kendaraan">
        <p>
          MBTA mengirim status dalam bahasa Inggris. Di kartu dan daftar, aplikasi menampilkannya dalam bahasa Indonesia. Nilai asli muncul
          sebagai tooltip pada lencana dan di baris &quot;Kode status API&quot; pada detail kendaraan.
        </p>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line text-ink-muted">
              <th className="py-1.5 pr-4 font-medium">Nilai API</th>
              <th className="py-1.5 font-medium">Ditampilkan sebagai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {STATUS_ROWS.map(([k, label]) => (
              <tr key={k}>
                <td className="py-1.5 pr-4">
                  <code className={code}>{k}</code>
                </td>
                <td className="py-1.5">{label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Block>

      <Block icon="solar:map-point-wave-linear" title="Lokasi dan GPS">
        <p>
          Baris <strong>&quot;Dekat: ...&quot;</strong> di kartu adalah halte yang dikaitkan MBTA dengan kendaraan (halte yang sedang disinggahi atau dituju).
          Namanya ikut terambil dalam permintaan daftar kendaraan yang sama, jadi tidak ada permintaan tambahan, dan bisa dicari lewat kotak cari.
        </p>
        <p>
          Nama jalan di popup detail dicari lewat <strong>Photon (komoot)</strong>, dengan <strong>Nominatim</strong> sebagai cadangan. Keduanya memakai data
          &copy; OpenStreetMap. Pencarian hanya dilakukan <strong>satu kali tiap popup dibuka</strong>, tidak pernah dari daftar, dan hasilnya disimpan per koordinat
          yang dibulatkan ke 3 desimal (sekitar 100 m) supaya pembaruan 30 detik tidak mengulang permintaan. Ini mengikuti batas pemakaian wajar layanan gratis
          tersebut. Bila gagal, baris lokasi tidak ditampilkan dan koordinat tetap ada.
        </p>
        <p>
          Kendaraan yang <code className={code}>updated_at</code>-nya lebih dari <strong>5 menit</strong> lalu diberi lencana &quot;GPS tidak update&quot;,
          waktunya berwarna oranye, dan penandanya di peta menjadi pudar dengan garis putus-putus. Angkanya ada di kartu &quot;GPS tidak update&quot; yang bisa diklik untuk menyaring.
        </p>
        <p>
          Peta detail menggambar jalur trip (<code className={code}>/trips/{'{id}'}?include=shape</code>, di-cache per trip) dan halte berikutnya dari{' '}
          <code className={code}>/predictions</code>, dengan <code className={code}>/schedules</code> sebagai cadangan berlabel &quot;Jadwal&quot;. Prediksi diperbarui tiap 30 detik
          hanya selama popup terbuka; bila gagal, garis dan daftar halte tidak ditampilkan.
        </p>
      </Block>

      <Block icon="solar:bug-linear" title="Simulasi kendala">
        <p>
          Pesan error di aplikasi ini bisa dilihat tanpa harus menunggu MBTA benar-benar bermasalah. Halaman Simulasi Kendala menyalakan satu skenario
          (koneksi putus, batas permintaan, server gangguan, kendaraan hilang, data kosong, peta atau nama jalan gagal) hanya untuk tab ini, ditandai
          bilah kuning di atas halaman. Tautan seperti <code className={code}>?simulate=rate-limit</code> langsung menyalakannya.
        </p>
        {simulation && (
          <a
            href={simulation.href}
            onClick={(e) => {
              e.preventDefault()
              simulation.onOpen()
            }}
            className="inline-flex h-10 items-center rounded-xl border border-line bg-paper px-4 font-medium text-ink hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Buka Simulasi Kendala
          </a>
        )}
      </Block>

      <Block icon="solar:check-square-linear" title="Teknologi">
        <ul className="divide-y divide-line/70">
          {STACK.map(([name, note]) => (
            <li key={name} className="flex flex-wrap justify-between gap-x-4 py-1.5 first:pt-0 last:pb-0">
              <span className="font-medium text-ink">{name}</span>
              <span className="text-ink-muted">{note}</span>
            </li>
          ))}
        </ul>
        <p>
          Filter, halaman, ukuran, kendaraan yang dibuka, dan halaman yang aktif disimpan di alamat (<code className={code}>?view=peta&amp;route=Red</code>),
          jadi tautan bisa dibagikan dan tombol Back bekerja.
        </p>
      </Block>
      </div>
    </div>
  )
}
