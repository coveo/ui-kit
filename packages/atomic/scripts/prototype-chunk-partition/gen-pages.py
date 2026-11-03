"""PROTOTYPE - page sets for the strategy experiments.
usage: gen-pages.py <pages.json> <out.json> --mode synth|singles|adr [--variants 4] [--seed 1] [--adr-dir DIR]
"""
import json, os, random, re, sys
args = sys.argv[1:]; src, out = args[:2]
opt = {args[i]: args[i + 1] for i in range(2, len(args), 2)}
P = json.load(open(src)); pages = P["pages"]; known = P["knownTags"]
mode = opt["--mode"]; extra = []
if mode == "synth":
    rnd = random.Random(int(opt.get("--seed", 1)))
    for p in pages:
        if p["family"] not in ("storybook", "cdn-smoke", "adr"): continue
        for v in range(int(opt.get("--variants", 4))):
            q = (0.4, 0.7)[v % 2]
            tags = sorted(t for t in p["tags"] if "interface" in t or rnd.random() < q)
            extra.append({"id": f"synthetic/{p['id']}/{v}", "family": "synthetic", "tags": tags, "unknownTags": [], "files": []})
elif mode == "singles":
    extra = [{"id": f"single/{t}", "family": "single", "tags": [t], "unknownTags": [], "files": []} for t in sorted(known)]
elif mode == "adr":
    d = opt["--adr-dir"]
    for name, pid in (("searchbox", "adr/search-box"), ("search", "adr/typical-search"), ("rich", "adr/rich-search"), ("commerce", "adr/commerce")):
        found = set(re.findall(r"<(atomic-[a-z0-9-]+)", open(os.path.join(d, name + ".html")).read()))
        extra.append({"id": pid, "family": "adr-harness", "tags": sorted(t for t in found if t in known),
                      "unknownTags": sorted(t for t in found if t not in known), "files": [name + ".html"]})
    pages = []
json.dump({"knownTags": known, "pages": pages + extra}, open(out, "w"), indent=1)
print(f"{len(pages)} pages + {len(extra)} {mode} -> {out}")
for e in extra[:4]:
    print("  ", e["id"], len(e["tags"]), "tags", ("unknown: " + " ".join(e["unknownTags"])) if e["unknownTags"] else "")
