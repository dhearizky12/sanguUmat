using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace backend.Auth
{
    // Issues and validates the bearer token that replaces the session cookie. The token
    // carries only who the visitor is (the Google claims the controllers already read);
    // the role is looked up from the User row on each request, so it is never stale.
    public static class TokenService
    {
        public const string ExternalScheme = "External";
        public const string Issuer = "sangu-umat";
        public const string Audience = "sangu-umat-ui";
        private const int MinKeyLength = 32;

        public static SymmetricSecurityKey GetKey(IConfiguration config)
        {
            var key = config["Jwt:Key"];
            if (string.IsNullOrEmpty(key) || key.Length < MinKeyLength)
            {
                throw new InvalidOperationException(
                    $"Jwt:Key is not configured or shorter than {MinKeyLength} characters.");
            }
            return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        }

        public static string Issue(IConfiguration config, ClaimsPrincipal google)
        {
            var days = int.TryParse(config["Jwt:ExpiryDays"], out var d) && d > 0 ? d : 7;
            var claims = new List<Claim>();
            foreach (var type in new[] { ClaimTypes.NameIdentifier, ClaimTypes.Email, ClaimTypes.Name, "picture" })
            {
                var value = google.FindFirst(type)?.Value;
                if (!string.IsNullOrEmpty(value)) claims.Add(new Claim(type, value));
            }

            var descriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Issuer = Issuer,
                Audience = Audience,
                Expires = DateTime.UtcNow.AddDays(days),
                SigningCredentials = new SigningCredentials(GetKey(config), SecurityAlgorithms.HmacSha256)
            };
            return new JsonWebTokenHandler().CreateToken(descriptor);
        }
    }
}
