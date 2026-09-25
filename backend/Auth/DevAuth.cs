namespace backend.Auth
{
    // Names shared between Program.cs, which registers the local mock Google login, and
    // AuthController, which decides per login whether to use it.
    public static class DevAuth
    {
        public const string MockGoogleScheme = "MockGoogle";
    }
}
