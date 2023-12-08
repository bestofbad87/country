# country
Cloudflare Worker Code for Country Flag

country.js - This code presents the authenticated user email, time and country code when authenticated. The country code is hyperlinked to a /secure/${country} page, where it should present the relevant country flag fetched from an R2 bucket. I am currently debugging the fetch action.

country_public_r2.js - This code is a test code that I used, which fetched the country flag mentioned above using the R2.Dev subdomain link. When R2.Dev is enabled in the R2 bucket, a publicly available link gets generated, which I have attached to the code with the ${country} variable. This code does present the country flag as expected. But this does not fulfil the assignment requirement of the R2 bucket having to be Private.

wrangler.toml - This is the wrangler configuration file.
