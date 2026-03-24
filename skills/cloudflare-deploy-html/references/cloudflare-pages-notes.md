# Cloudflare Pages Notes

Use this reference only when the user asks about domain setup, privacy, or Cloudflare routing details.

## Domain shape

- For `example.com/{subpath}` on an apex custom domain, Cloudflare Pages requires the domain to be added as a Cloudflare zone and the nameservers pointed to Cloudflare.
- For a subdomain such as `reports.example.com`, Cloudflare Pages can work with a DNS CNAME pointing the subdomain at `<project>.pages.dev`.

## Privacy options

- Shared password:
  - The skill's helper script can generate Pages middleware for HTTP Basic Auth.
  - This is a shared secret, not user-specific access control.
  - Good for low-stakes privacy.
- Cloudflare Access:
  - Better when you want an allowlist, email-based login, or stronger policy control.
  - Access can protect specific paths on a custom domain.

## Pages hostname

- Cloudflare gives every Pages project a `*.pages.dev` hostname.
- If the user wants the custom domain to be the only public entrypoint, redirect the `*.pages.dev` hostname to the custom domain after the deployment works.

## Useful docs

- Pages direct upload:
  - https://developers.cloudflare.com/pages/get-started/direct-upload/
- Pages custom domains:
  - https://developers.cloudflare.com/pages/configuration/custom-domains/
- Redirect `*.pages.dev` to a custom domain:
  - https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/
- Cloudflare Access application paths:
  - https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/
- Cloudflare Access one-time PIN:
  - https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/
- Cloudflare Workers Basic Auth example:
  - https://developers.cloudflare.com/workers/examples/basic-auth/
