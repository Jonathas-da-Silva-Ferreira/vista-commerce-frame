// Centralised <head> manager used by every route to set its own title,
// description, and canonical URL. We extract this into a small wrapper so:
//  1) Pages don't duplicate Helmet boilerplate (DRY).
//  2) The canonical URL is always built from a single base domain — fixing
//     a typo here propagates to every page without a hunt-and-replace.
//  3) We keep crawler-critical tags (title/description/canonical/og:*) in one
//     auditable file, which is exactly what SEO scanners look at first.

import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

// Production domain advertised in sitemap.xml — must match exactly so
// rel=canonical and og:url agree with the URL Google actually indexes.
const SITE_URL = "https://vista-commerce-frame.lovable.app";

interface SEOProps {
  // Page-specific title. We append the brand suffix here so callers don't
  // have to remember to do it — consistent branding without repetition.
  title: string;
  // <160 chars: anything longer is truncated in SERPs and wastes pixel budget.
  description: string;
  // Optional override; defaults to current pathname so canonical always
  // matches what the user actually requested.
  canonicalPath?: string;
  // og:type defaults to "website"; product/article pages may override.
  ogType?: string;
}

export default function SEO({ title, description, canonicalPath, ogType = "website" }: SEOProps) {
  const { pathname } = useLocation();
  // Strip a trailing slash (other than root) so /products and /products/
  // don't both end up indexed as separate URLs.
  const path = canonicalPath ?? pathname;
  const normalized = path === "/" ? "/" : path.replace(/\/+$/, "");
  const canonical = `${SITE_URL}${normalized}`;
  // Brand suffix kept short — total title under ~60 chars is the SERP budget.
  const fullTitle = `${title} — Nexora`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {/* Canonical eliminates duplicate-content issues when the same page
          is reachable via multiple URLs (query params, trailing slashes). */}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={ogType} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
