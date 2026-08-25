# Broken Link and Missing Media Audit

**Audit date:** 25 August 2026  
**Repository:** `karefined-eng/abednego-lomazah`  
**Deployment checked:** [abednego-lomazah-site.vercel.app](https://abednego-lomazah-site.vercel.app/)

## Executive finding

No missing local images, videos, posters, stylesheets, scripts, or internal page links were found in the repository. The six public HTML pages checked on Vercel all returned HTTP 200, and the deployed-page scan found no referenced local asset returning HTTP 4xx or 5xx.

Four external destinations returned automated-request restrictions rather than confirmed broken-link responses. Google Forms requires sign-in, LinkedIn presents an authentication wall, Studocu presents registration/CAPTCHA gating, and YouTube returned a temporary anti-bot page. Those destinations are reachable, but their content could not be fully verified anonymously from this audit environment.

## Public pages checked

| Page | Deployed result | Local asset result |
| --- | --- | --- |
| `index.html` | HTTP 200 | No missing local references |
| `resources.html` | HTTP 200 | No missing local references |
| `updates.html` | HTTP 200 | No missing local references |
| `everlasting.html` | HTTP 200 | No missing local references |
| `privacy.html` | HTTP 200 | No missing local references |
| `removal-requests.html` | HTTP 200 | No missing local references |

The audit also checked local JavaScript media references, including the dynamic #EVERLASTING portrait images. All five portrait paths exist under `assets/headshots/`.

## External destinations requiring attention

| Destination | Observed response | Interpretation | Recommended action |
| --- | --- | --- | --- |
| [Google Forms removal request](https://docs.google.com/forms/d/e/1FAIpQLSef4KRn-xfwDQTQ9brdUM5f7xQPZ8PwhkUXqRg8yt31TWGjRA/viewform?usp=header) | Automated request: HTTP 401; browser redirected to Google sign-in | The form is not publicly available to an anonymous visitor in this session. | Confirm the form’s sharing setting. If public submissions are intended, allow respondents without requiring Google sign-in. |
| [LinkedIn profile](https://www.linkedin.com/in/abednego-lomazah-409767393/) | Automated request: HTTP 999; browser redirected to LinkedIn auth wall | LinkedIn is blocking or gating anonymous access. This is not proof that the profile is deleted. | Test while signed in or leave the link if the profile is known to be active. |
| [Studocu CGPA/FGPA guide](https://www.studocu.com/row/document/sd-dombo-university-of-business-and-integrated-development-studies-sdd-ubids/hotel-restaurant-management/abednego-lomazah-cgpa-fgpa-calculation-guide-0535831056/161630179) | Automated request: HTTP 403; browser reached registration/CAPTCHA interstitial | The resource is gated against anonymous access. | Confirm that the document is still published and that students can access it without an unexpected account requirement. |
| [YouTube UGRC 150 revision video](https://www.youtube.com/watch?v=bVMtr44nq5U) | Automated request: HTTP 429; browser showed a temporary unusual-traffic page | YouTube rate-limited the audit environment. This is not a confirmed deleted video. | Open the URL from a normal browser session to confirm the video remains public. |

The remaining external destinations tested—WhatsApp, TikTok, the YouTube channel, both Scribd study packs, Google Privacy, Instagram, WhatsApp Privacy, and YouTube Terms—responded successfully during the automated check.

## Notes on false positives

The local scanner reported `${actionUrl}` and `${escapeHTML(tribute.image)}` as missing strings. These are JavaScript template variables, not literal asset paths. It also treated `assets/js/everlasting.js?v=3` as a filename; the `?v=3` portion is a cache-busting query parameter, and the underlying script exists.

## Conclusion

The site’s **local and internal link structure is clean**. The only items requiring human confirmation are the four external destinations whose owners intentionally restrict anonymous or automated access. No broken local images or videos were found.

## References

1. [Google Forms removal-request destination](https://docs.google.com/forms/d/e/1FAIpQLSef4KRn-xfwDQTQ9brdUM5f7xQPZ8PwhkUXqRg8yt31TWGjRA/viewform?usp=header)
2. [LinkedIn profile destination](https://www.linkedin.com/in/abednego-lomazah-409767393/)
3. [Studocu CGPA/FGPA guide destination](https://www.studocu.com/row/document/sd-dombo-university-of-business-and-integrated-development-studies-sdd-ubids/hotel-restaurant-management/abednego-lomazah-cgpa-fgpa-calculation-guide-0535831056/161630179)
4. [YouTube UGRC 150 revision destination](https://www.youtube.com/watch?v=bVMtr44nq5U)
