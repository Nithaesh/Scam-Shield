"""Indian brand registry used for lookalike-domain detection.

The registry deliberately stores *registrable* official domains only. A host is
treated as official when it equals, or is a subdomain of, one of these domains,
so ``netbanking.hdfcbank.com`` and ``bescom.karnataka.gov.in`` are both covered
without listing every host.

Data is static and offline: no brand data is fetched at runtime.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final, Iterable


@dataclass(frozen=True)
class Brand:
    """An organisation that scammers commonly impersonate.

    Attributes:
        name: Human-readable entity name used in findings.
        domains: Official registrable domains owned by the entity.
        tokens: Distinctive strings matched anywhere in a domain label.
        exact_tokens: Short or ambiguous strings matched only as a whole
            hyphen/dot separated part of a domain label.
    """

    name: str
    domains: tuple[str, ...]
    tokens: tuple[str, ...] = ()
    exact_tokens: tuple[str, ...] = ()


#: Domains that are legitimately operated by a listed brand. These are checked
#: before lookalike detection, so Amazon's many country domains never produce a
#: false positive.
BRANDS: Final[tuple[Brand, ...]] = (
    # ---------------------------------------------------------------- banks
    Brand("SBI Card", ("sbicard.com",), ("sbicard",)),
    Brand(
        "State Bank of India",
        (
            "sbi.co.in",
            "onlinesbi.sbi",
            "onlinesbi.com",
            "sbiyono.sbi",
            "sbilife.co.in",
            "sbimf.com",
            "sbigeneral.in",
            "sbisecurities.in",
            "sbicapsec.com",
        ),
        ("sbi", "onlinesbi", "sbiyono"),
    ),
    Brand(
        "HDFC Bank",
        (
            "hdfcbank.com",
            "hdfcbank.net",
            "hdfc.com",
            "hdfcsec.com",
            "hdfcmf.com",
            "hdfcergo.com",
        ),
        ("hdfc", "hdfcbank", "hdfcbk"),
    ),
    Brand("HDFC Life", ("hdfclife.com",), ("hdfclife",)),
    Brand(
        "ICICI Bank",
        (
            "icicibank.com",
            "icicibank.co.in",
            "icici.com",
            "icicidirect.com",
            "icicipru.com",
            "icicilombard.com",
            "iciciamc.com",
        ),
        ("icici", "icicibank", "icicib"),
    ),
    Brand(
        "Axis Bank",
        ("axisbank.com", "axisbank.co.in", "axis.com", "axismf.com", "axisfinance.in"),
        ("axisbank",),
        ("axis",),
    ),
    Brand(
        "Kotak Mahindra Bank",
        ("kotak.com", "kotakbank.com", "kotak811.com", "kotakmf.com", "kotaksecurities.com"),
        ("kotak", "kotakbank"),
    ),
    Brand(
        "Punjab National Bank",
        ("pnbindia.in", "pnb.co.in", "pnbnet.in", "pnbmetlife.com", "pnbhousing.in"),
        ("pnbindia",),
        ("pnb",),
    ),
    Brand(
        "Bank of Baroda",
        ("bankofbaroda.in", "bankofbaroda.com", "bobfinancial.com"),
        ("bankofbaroda",),
        ("bob",),
    ),
    Brand(
        "Canara Bank",
        ("canarabank.com", "canarabank.in", "canarahsbclife.com"),
        ("canarabank",),
    ),
    Brand(
        "Union Bank of India",
        ("unionbankofindia.co.in", "unionbankonline.co.in"),
        ("unionbank",),
    ),
    Brand("IDBI Bank", ("idbibank.in", "idbibank.com"), ("idbi",)),
    Brand("Yes Bank", ("yesbank.in", "yesbank.com"), ("yesbank",)),
    Brand(
        "IndusInd Bank",
        ("indusind.com", "indusindbank.com"),
        ("indusind", "indusindbank"),
    ),
    Brand(
        "Federal Bank",
        ("federalbank.co.in", "federalbank.in"),
        ("federalbank",),
    ),
    Brand(
        "IDFC FIRST Bank",
        ("idfcfirstbank.com", "idfcbank.com", "idfc.com"),
        ("idfc", "idfcfirst"),
    ),
    Brand("RBL Bank", ("rblbank.com", "rblbank.in"), ("rblbank",)),
    Brand("LIC", ("licindia.in", "licindia.com"), ("licindia",), ("lic",)),
    # -------------------------------------------------------------- fintech
    Brand(
        "Paytm",
        ("paytm.com", "paytmbank.com", "paytm.in"),
        ("paytm",),
    ),
    Brand("PhonePe", ("phonepe.com", "phonepe.in"), ("phonepe",)),
    Brand(
        "Google Pay",
        (
            "google.com",
            "google.co.in",
            "googleapis.com",
            "google-analytics.com",
            "gstatic.com",
            "youtube.com",
            "youtu.be",
            "goo.gl",
        ),
        ("googlepay", "gpay", "google"),
    ),
    Brand(
        "Amazon Pay",
        ("amazonpay.in", "amazonpay.com"),
        ("amazonpay",),
    ),
    Brand("MobiKwik", ("mobikwik.com",), ("mobikwik",)),
    Brand("FreeCharge", ("freecharge.in",), ("freecharge",)),
    Brand("CRED", ("cred.club",), (), ("cred",)),
    Brand("Razorpay", ("razorpay.com",), ("razorpay",)),
    Brand("BharatPe", ("bharatpe.com",), ("bharatpe",)),
    # ---------------------------------------------------------- e-commerce
    Brand(
        "Amazon",
        (
            "amazon.in",
            "amazon.com",
            "amazon.co.uk",
            "amazon.de",
            "amazon.ca",
            "amazon.com.au",
            "amazon.sg",
            "amazon.ae",
            "amazon.com.br",
            "amazon.co.jp",
            "amazonaws.com",
            "cloudfront.net",
        ),
        ("amazon",),
    ),
    Brand(
        "Flipkart",
        ("flipkart.com", "flipkart.in", "fkrt.it"),
        ("flipkart",),
    ),
    Brand("Myntra", ("myntra.com",), ("myntra",)),
    Brand("Meesho", ("meesho.com",), ("meesho",)),
    Brand("Snapdeal", ("snapdeal.com",), ("snapdeal",)),
    Brand("Nykaa", ("nykaa.com",), ("nykaa",)),
    Brand("Tata Power", ("tatapower.com",), ("tatapower",)),
    Brand(
        "Tata Neu",
        (
            "tata.com",
            "tataneu.com",
            "tatacliq.com",
            "tatamotors.com",
            "tatasteel.com",
            "tatasky.com",
            "tata-capital.com",
            "tataaig.com",
            "titan.co.in",
            "tajhotels.com",
        ),
        ("tataneu",),
        ("tata",),
    ),
    Brand("Blinkit", ("blinkit.com",), ("blinkit",)),
    Brand("BigBasket", ("bigbasket.com",), ("bigbasket",)),
    Brand("Swiggy", ("swiggy.com", "swiggy.in"), ("swiggy",)),
    Brand("Zomato", ("zomato.com",), ("zomato",)),
    Brand("Domino's India", ("dominos.in", "dominos.com"), ("dominos",)),
    # ---------------------------------------------------------- telecom etc.
    Brand("Airtel", ("airtel.in", "airtel.com"), ("airtel",)),
    Brand(
        "Jio",
        ("jio.com", "jiomart.com", "jiofiber.com", "jiocinema.com", "jiosaavn.com", "jiohotstar.com"),
        (),
        ("jio",),
    ),
    Brand(
        "Vi (Vodafone Idea)",
        ("myvi.in", "vi.in", "vodafone.in", "vodafone.com"),
        ("vodafone", "myvi"),
        ("vi",),
    ),
    Brand("BSNL", ("bsnl.co.in", "bsnl.in"), ("bsnl",)),
    # -------------------------------------------------------------- travel
    Brand(
        "IRCTC",
        ("irctc.co.in", "irctc.com", "irctc.in"),
        ("irctc",),
    ),
    Brand(
        "IndiGo",
        ("goindigo.in", "indigo.in"),
        ("goindigo", "indigo"),
    ),
    Brand(
        "MakeMyTrip",
        ("makemytrip.com",),
        ("makemytrip",),
    ),
    Brand("Ola", ("olacabs.com", "ola.com"), ("olacabs",), ("ola",)),
    Brand("Uber India", ("uber.com", "ubereats.com"), ("uber",)),
    # ---------------------------------------------------------- government
    Brand(
        "India Post",
        ("indiapost.gov.in", "indiapost.com"),
        ("indiapost",),
    ),
    Brand(
        "Income Tax Department",
        ("incometax.gov.in", "incometaxindia.gov.in"),
        ("incometax",),
    ),
    Brand(
        "UIDAI (Aadhaar)",
        ("uidai.gov.in", "aadhaar.uidai.gov.in"),
        ("uidai", "aadhaar"),
    ),
    Brand(
        "Employees' Provident Fund Organisation",
        ("epfindia.gov.in", "epfindia.com"),
        ("epfindia", "epfo"),
    ),
    Brand("Reserve Bank of India", ("rbi.org.in",), (), ("rbi",)),
    Brand(
        "Cyber Crime Portal",
        ("cybercrime.gov.in",),
        ("cybercrime",),
    ),
    Brand("GST Portal", ("gst.gov.in",), (), ("gst",)),
    Brand(
        "Passport Seva",
        ("passportindia.gov.in",),
        ("passportseva", "passportindia"),
    ),
    # ---------------------------------------------------------- logistics
    Brand("Delhivery", ("delhivery.com",), ("delhivery",)),
    Brand("Blue Dart", ("bluedart.com",), ("bluedart",)),
    Brand("DTDC", ("dtdc.in", "dtdc.com"), ("dtdc",)),
    Brand("Ekart", ("ekart.com", "ekart.in"), ("ekart",)),
    # ------------------------------------------------------------ utilities
    Brand(
        "Adani Electricity",
        ("adanielectricity.com",),
        ("adanielectricity",),
    ),
    Brand(
        "BESCOM",
        ("bescom.karnataka.gov.in", "bescom.co.in", "karnataka.gov.in"),
        ("bescom",),
    ),
    Brand(
        "MSEDCL (Mahadiscom)",
        ("mahadiscom.in", "msedcl.in"),
        ("mahadiscom", "msedcl"),
    ),
    Brand(
        "BSES Delhi",
        ("bsesdelhi.com", "bses.in"),
        ("bsesdelhi", "bses"),
    ),
    # --------------------------------------------------- lotteries & media
    Brand(
        "Kaun Banega Crorepati (KBC)",
        ("sonyliv.com",),
        ("kbc", "crorepati"),
    ),
    Brand("Netflix", ("netflix.com",), ("netflix",)),
    # ---------------------------------------------------------- messaging
    Brand("WhatsApp", ("whatsapp.com", "whatsapp.net", "wa.me"), ("whatsapp",)),
    Brand("Telegram", ("telegram.org", "t.me"), ("telegram",)),
    Brand("Microsoft", ("microsoft.com", "live.com", "office.com"), ("microsoft",)),
    Brand(
        "Apple",
        ("apple.com", "icloud.com"),
        ("applepay", "icloud"),
        ("apple",),
    ),
    Brand(
        "Meta",
        ("facebook.com", "fb.com", "instagram.com", "meta.com"),
        ("facebook", "instagram"),
        ("meta",),
    ),
)


#: Domains that only shorten links. They are not "brands", but a link that
#: hides its destination is a meaningful risk signal.
SHORTENERS: Final[frozenset[str]] = frozenset(
    {
        "bit.ly",
        "bitly.com",
        "tinyurl.com",
        "t.co",
        "cutt.ly",
        "is.gd",
        "rb.gy",
        "goo.gl",
        "ow.ly",
        "wa.me",
        "v.gd",
        "shorturl.at",
        "bl.ink",
        "rebrand.ly",
        "t.ly",
        "shorte.st",
        "adf.ly",
        "clck.ru",
        "s.id",
        "lnkd.in",
        "trib.al",
        "buff.ly",
        "ift.tt",
        "dlvr.it",
        "soo.gd",
        "u.to",
        "x.co",
        "zpr.io",
        "kutt.it",
        "tiny.cc",
        "fkrt.it",
    }
)


#: TLDs with a high abuse rate. Used only as supporting context; a TLD alone
#: never decides a verdict.
SUSPICIOUS_TLDS: Final[frozenset[str]] = frozenset(
    {
        "xyz",
        "top",
        "click",
        "buzz",
        "work",
        "site",
        "vip",
        "icu",
        "loan",
        "app",
        "club",
        "info",
        "online",
        "live",
        "rest",
        "cc",
        "cfd",
        "monster",
        "sbs",
        "quest",
        "link",
        "support",
        "help",
        "fit",
        "cam",
        "shop",
        "store",
        "website",
        "space",
        "fun",
        "host",
        "press",
        "pw",
        "tk",
        "ml",
        "ga",
        "cf",
        "gq",
    }
)


#: Well-known legitimate hosts that contain a brand token but are not run by a
#: brand in the registry. Kept small and explicit to avoid false positives.
ALLOWED_HOSTS: Final[frozenset[str]] = frozenset(
    {
        "github.com",
        "githubusercontent.com",
        "gitlab.com",
        "wikipedia.org",
        "wikimedia.org",
        "cloudflare.com",
        "akamai.net",
        "akamaihd.net",
        "doubleclick.net",
        "zoom.us",
        "dropbox.com",
        "slack.com",
        "discord.com",
        "spotify.com",
        "twitter.com",
        "x.com",
        "linkedin.com",
        "paypal.com",
        "visa.com",
        "mastercard.com",
        "npci.org.in",
        "bhimupi.org.in",
        "microsoftonline.com",
        "office.net",
        "windows.net",
        "azure.com",
        "outlook.com",
        "hotmail.com",
        "yahoo.com",
        "reddit.com",
        "quora.com",
        "medium.com",
        "coursera.org",
        "udemy.com",
        "flipboard.com",
    }
)


def iter_official_domains() -> Iterable[str]:
    """Yield every official domain in the registry (may contain duplicates)."""
    for brand in BRANDS:
        yield from brand.domains


def host_is_official(hostname: str) -> bool:
    """Return True when ``hostname`` is, or is a subdomain of, an official host."""
    host = (hostname or "").strip().lower().rstrip(".")
    if not host:
        return False
    if host in ALLOWED_HOSTS:
        return True
    for allowed in ALLOWED_HOSTS:
        if host.endswith("." + allowed):
            return True
    for brand in BRANDS:
        for domain in brand.domains:
            if host == domain or host.endswith("." + domain):
                return True
    return False


def brand_for_domain(domain: str) -> Brand | None:
    """Return the brand that owns ``domain`` (including subdomains)."""
    host = (domain or "").strip().lower().rstrip(".")
    for brand in BRANDS:
        for official in brand.domains:
            if host == official or host.endswith("." + official):
                return brand
    return None


def brand_for_name(name: str) -> Brand | None:
    """Return the brand matching a claimed organisation name, if any."""
    compact = _compact(name)
    if not compact:
        return None
    for brand in BRANDS:
        if compact == _compact(brand.name):
            return brand
        if compact in {_compact(alias) for alias in brand.tokens + brand.exact_tokens}:
            return brand
    for brand in BRANDS:
        for token in brand.tokens:
            if len(token) >= 4 and token in compact:
                return brand
        for token in brand.exact_tokens:
            if token == compact:
                return brand
    return None


def _compact(value: str) -> str:
    """Lowercase and keep only letters and digits."""
    return "".join(ch for ch in str(value or "").lower() if ch.isalnum())
