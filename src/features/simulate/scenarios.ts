import { ApiError } from '../../api/errors'
import type { SimMode } from '../../api/simulate'

export interface Scenario {
  mode: SimMode
  icon: string
  /** What is switched on, in plain words. */
  summary: string
  /** Where the message shows up: the vehicle list, or the popup of one vehicle. */
  target: 'list' | 'popup'
  /** The real error shown through ErrorState, or a plain note for states that are not an ApiError. */
  preview: { error: ApiError } | { note: string; detail: string }
}

export const SCENARIOS: Scenario[] = [
  {
    mode: 'offline',
    icon: 'solar:wi-fi-cross-linear',
    summary: 'Semua permintaan ke MBTA gagal seperti saat internet putus.',
    target: 'list',
    preview: { error: new ApiError('network') },
  },
  {
    mode: 'rate-limit',
    icon: 'solar:hourglass-linear',
    summary: 'MBTA menjawab 429. Aplikasi menghitung mundur lalu mencoba lagi sendiri.',
    target: 'list',
    preview: { error: new ApiError('http', 429, 'rate_limited') },
  },
  {
    mode: 'server',
    icon: 'solar:server-linear',
    summary: 'MBTA menjawab 503, seperti saat servernya sedang gangguan.',
    target: 'list',
    preview: { error: new ApiError('http', 503, 'service_unavailable') },
  },
  {
    mode: 'not-found',
    icon: 'solar:question-circle-linear',
    summary: 'Detail kendaraan dijawab 404, seperti kendaraan yang baru selesai beroperasi.',
    target: 'popup',
    preview: { error: new ApiError('http', 404, 'not_found') },
  },
  {
    mode: 'bad-request',
    icon: 'solar:forbidden-circle-linear',
    summary: 'Daftar kendaraan dijawab 400 dengan keterangan teknis dari MBTA.',
    target: 'list',
    preview: { error: new ApiError('http', 400, 'bad_request', 'Invalid filter[route]: "Merah" is not a route id') },
  },
  {
    mode: 'slow',
    icon: 'solar:wi-fi-low-linear',
    summary: 'Setiap permintaan ditahan 4 detik sebelum berhasil, untuk melihat kerangka pemuatan.',
    target: 'list',
    preview: { note: 'Kerangka kartu tampil dulu', detail: 'Setelah ±4 detik data muncul seperti biasa.' },
  },
  {
    mode: 'empty',
    icon: 'solar:inbox-linear',
    summary: 'MBTA menjawab berhasil tetapi tanpa satu pun kendaraan.',
    target: 'list',
    preview: { note: 'Belum ada kendaraan yang melapor posisi saat ini', detail: 'MBTA biasanya tidak beroperasi sekitar pukul 01:00-05:00 waktu Boston.' },
  },
  {
    mode: 'map-fail',
    icon: 'solar:map-point-remove-linear',
    summary: 'Berkas peta gagal diunduh. Popup tetap bisa dipakai dan peta bisa dicoba lagi.',
    target: 'popup',
    preview: { note: 'Peta gagal dimuat', detail: 'Tombol "Coba lagi" muncul di tempat peta, data kendaraan di sampingnya tetap tampil.' },
  },
  {
    mode: 'geocode-fail',
    icon: 'solar:map-arrow-right-linear',
    summary: 'Layanan nama jalan (Photon dan Nominatim) tidak menjawab.',
    target: 'popup',
    preview: { note: 'Nama jalan belum bisa dimuat', detail: 'Koordinat di atas tetap akurat, hanya baris Lokasi yang diganti catatan ini.' },
  },
]
