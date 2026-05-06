/* ===========================================================
   Atlas — background image catalog.

   Two providers, both reliable + free + no auth required:
   - Lummi.ai (curated AI-generated abstract backgrounds)
   - Picsum.photos (deterministic seeded photo CDN)

   All entries serve a 16:9-ish landscape image suitable for
   wallpaper / cover-art / hero-background use.
   =========================================================== */

const lummiAssets: string[] = [
  'QmZTxxBscjNYygShX9Krj3nJ8vJgvmt7U2ZqKNDMMBw7RS',
  'QmSuw5SnxvovHwHZcpExyMgAms9jm9CbYdxsU5TS2ivq27',
  'QmSWEvBsVsiJq4GHiiUGK9wG3ZSpo5jiMsBvEPUCTg77wF',
  'QmawqDbrczUshFnEBULjPVVuGTisRwf1CtvBzLjHq3pwQR',
  'QmPYWbgKv9xr1ZXtSsf6vQuiYC9yKJeuCkxFpvVJyF48q5',
  'QmUx3immQzdSQMXAVNxGw1jg4zkufsCzr77GCQzUdYhTP3',
  'Qmai4f8zGXZKZ369TRgdkXZxckKaATbCkp1XmQjQiqP2DV',
  'QmTZKPhCtYtTSyRzUxAd81Z74GebnUMkt2xKQpmUymGmZM',
  'QmXYx2gR2tKH6XU4stoyaNfpHvznSGTNaGaYhc1ztQaUVV',
  'QmT7pLyymSea2ardZxGUEpt8aKbxS2JusjirdiCtuJsz2a',
  'QmcDB6o6MbqrnfQAmk8WoL4e3qRJ2m1QrySiRsKCMgEw1f',
  'QmXBDfiSKxGT4s9fuqt5H2XegTk3SYeREqWvz366RPvuFy',
  'QmdZRVWmQCv1B2QeXnDBbVu4tFc8tXoeJfDfRNZsRxGRxP',
  'QmUT1cZ14Hi9ojgmJDeJoP7F4DiA3Vf1CrTqW7vULwy85w',
  'QmcuExZK3nUC9qtraA1xD98khYugehPzrZo5rpMwKUrWyS',
  'QmdukKPfcuz65T2V6kCLp8tDUB227hCrBf8dFPzcrfjH7j',
  'QmaRwWXFmMTFtSLvVCmhC21AoUvYQHXdBLM2YRsC9WxFMx',
  'QmaGpJV4dYJfJJ4GhSDrnMiuQVoGpFF1v6mwCXHZTRW1Pm',
  'QmeEeLcpK59HuW29uSSyBXMaKyKVZai5ggAgMuTCysAJhe',
  'QmSaAsyKBUJK9gzXXDzevfjJXg9JY4wrgj3ox2SKvD7mU1',
  'QmTNpEFVCSBQPAqchUydHKnHEzgDFbepRifcvGRURzmV2Y',
  'QmYVVYRdnpfYtCX9kRTfgyitpf1pjqK2txvw7PkefSC9YM',
  'QmV8CQmGHX25ppT3E5Yh9Ahiint9cMfKECMRHFyeoH93ts',
  'QmatW1nkeLLb3hzUpqvU9j6tGo6swbSCxTgxQD7T5JM2VH',
  'QmYnkvLVT3xxHuQqMzYUiiXv4ataAhkwwKsM5rv5fHGSo4',
  'QmXLs9nCsuY2TiCFBrwmn4dSY7EKjrTSqyWfoT9Xkt1tJU',
  'QmRByLgds6sSMohVjq9K2AJQix4YvEPtJitJmj3LJNVTiu',
  'QmUdcPh1VytpKfzBwojQwhQFX4DbgniPMHp5b7CS3xC3Lz',
  'Qmeb9uE7MoByzjer46zuJGkZ1kqAuP9BRBpqULiJjvdJVT',
  'QmUEu3nBovKas6MKCZkumFDV8jcxLW6VsFodYhRsSQM4tx',
  'QmWx5tFudQ97DrBndAEhre3tMy8CHppUtpqtQPqUNb3TrS',
  'QmZ5AYCcKcS5WGpoRWozEmKRWunbAZgJtZLArgpvsemne3',
  'QmRXUT2sxEnSzs6Ms71pxzadPSH769FzayJWnU5BjnRs6M',
  'Qmb2RRkXZ5omQ3PPFHyx5TpxrE85QyUbjTZGoZrR9rkqgf',
  'QmYakaM2ky8vWxnBrTEaL4xNCaZxAUiWJcKpe7Bqhip1rf',
  'QmZqYoYewdq7httoAyBs61FtFMGH7PUoUsXAkG7AGHTwjE',
  'QmTGGuANUUYjoZJx1pKJeJLXn4aEqLQNCVuaErZTkK91Sx',
  'QmVJJHXMdFTFDEhW2WVyN8A9gun2myavALobY36MxtfFYc',
  'QmP4MTq8worMdtbp7TXFFcjJHffwqVsBCfhZVGrzkRiQV4',
  'QmNYt2YHa4Nz598q1kz5phBmScp792CyqHtbgBVnwRUuUf',
  'QmQPMSpyUxyhqw8qb61pQVRnTaDbaQ22dkzc4PSXCvk4vE',
];

/**
 * Deterministic Picsum seeds — same seed = same photo. Reasonable spread of
 * categories: landscape, mountain, coast, forest, city, abstract, sky.
 */
const picsumSeeds: string[] = [
  'atlas-northern-fjord',
  'atlas-summit-ridge',
  'atlas-pacific-cove',
  'atlas-dune-crest',
  'atlas-arctic-light',
  'atlas-twilight-coast',
  'atlas-iron-canyon',
  'atlas-pine-forest',
  'atlas-misty-valley',
  'atlas-glass-skyline',
  'atlas-marina-bay',
  'atlas-rosé-sky',
  'atlas-volcanic-shore',
  'atlas-prairie-storm',
  'atlas-redwoods',
  'atlas-rainforest-fall',
  'atlas-savannah',
  'atlas-low-tide',
  'atlas-mid-summer',
  'atlas-aurora',
  'atlas-cliffs-of-moher',
  'atlas-dolomites',
  'atlas-iceland-mossy',
  'atlas-tokyo-rain',
  'atlas-paris-rooftops',
  'atlas-new-york-grid',
  'atlas-marrakech-tile',
  'atlas-brooklyn-stoop',
  'atlas-istanbul-bosphorus',
  'atlas-rio-coastline',
  'atlas-savoy',
  'atlas-pacific-northwest',
  'atlas-andes-peak',
  'atlas-mediterranean',
  'atlas-bermuda',
  'atlas-fiji-reef',
  'atlas-norway-fjord',
  'atlas-faroe-islands',
  'atlas-scottish-highlands',
  'atlas-sahara-night',
  'atlas-yosemite-valley',
  'atlas-banff',
  'atlas-jasper',
];

export const imageUrls: string[] = [
  ...lummiAssets.map((id) => `https://assets.lummi.ai/assets/${id}`),
  ...picsumSeeds.map((seed) => `https://picsum.photos/seed/${seed}/2400/1350`),
];
