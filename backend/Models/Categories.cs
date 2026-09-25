namespace backend.Models
{
    // Keys mirror src/lib/category.js on the frontend exactly, so categoryLabel() there keeps
    // working unchanged once the FE switches from the matchCategory() heuristic to this field.
    public static class Categories
    {
        public const string Sholat = "sholat";
        public const string Puasa = "puasa";
        public const string Zakat = "zakat";
        public const string Keluarga = "keluarga";
        public const string Muamalah = "muamalah";

        public static readonly string[] All = { Sholat, Puasa, Zakat, Keluarga, Muamalah };
    }
}
