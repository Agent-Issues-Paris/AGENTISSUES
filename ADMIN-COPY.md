# Admin copy, October 2026

Texts that live in Shopify admin, not in the theme. Paste each one into the field named above it. Brand name everywhere: **Agent Issues**.

The theme adds " | Agent Issues" to every page title unless the title already contains "Agent Issues". Don't type the brand into SEO titles yourself.

## Home page

Already set in the theme: Theme settings → Sharing → Home page title / description. Online Store → Preferences can stay as it is; the theme setting wins.

- Title: `Agent Issues | Independent Fashion & Art Magazine, Paris`
- Description: `Agent Issues is an independent print magazine from Paris on fashion, art, games and internet culture. 200+ pages, half text, half image. Issue 01 out now.`

Default share image: upload `Branding + Assets/Site 2026-10/og-default-1200x630.jpg` in Theme settings → Sharing → Default social sharing image. The current one (AA_Site.png) carries the old AAGENT+ name.

## Collection SHOP

Products → Collections → SHOP → Search engine listing.

- Title: `Shop Magazines and Merch`
- Description: `Buy Agent Issues print magazines and limited merch, hand-printed in Paris. Issue 01 'I ❤️ INSPO' and I ❤️ INSPO tees in black and white.`

## Pages

Online Store → Pages → page → Search engine listing.

**About**
- Title: `About Agent Issues, Independent Magazine from Paris`
- Description: `Agent Issues is an independent print magazine made in Paris by Ilya Egorov and Zlata Egorova. Two issues a year on fashion, art, music, games and the internet.`

**Contact** (the current description says "AAGENT+")
- Title: `Contact`
- Description: `Write to Agent Issues about press, stockists, collaborations or pitching for the next issue: agentissuesparis@gmail.com or @agent.issues on Instagram.`

## Issue 01

Product title: change `ISSUE 01 'I ❤️ INSPO' F/W 26` to `ISSUE 01 'I ❤️ INSPO' FW25/26`, as printed on the cover.

SEO title: `Issue 01 'I ❤️ Inspo' Print Magazine`
SEO description: `Issue 01 of Agent Issues, an independent print magazine from Paris. 208 pages on inspo as status currency, with 30+ contributors from fashion, art and games.`

Description: clear the field first (the current one was pasted from Instagram and carries hidden markup), then paste:

```
Our first issue is about inspo. The rare un-Googlable image now works like money: it buys taste, status and a seat in the group chat. We tracked where references come from and who gets the credit, through fashion, art, games and the internet.

Inside: Nastya Livadnova, the maker of World of Dogs, Raphaël Lugassy's phone photos, Fake Nature by Onek4ever, Roman Mokrov's School for Fools, Girls Carrying Shit, Miniotics, moodboards from 13 creatives, and Ten Today on 10 copies that beat the originals.

Contributors:
Nastya Livadnova
Joseph Hauser
Raphaël Lugassy
Mika Ben Amar
Onek4ever
Ellie Warnke
Cloe Franco
Dora Kapus
Elizaveta Rakhmankulova
Goun Jeong
Mizuki Hirano
Mery Hoc
Patrick Garvey
Malene Specht
Phoebe Pendergast
Sofia Castellon
Nika Shulga
Teo Cisorio
Roman Mokrov
Girls Carrying Shit
Gunner Dongieux

Words by:
Ilya Egorov
Halle Robbe
Ten Today (tentoday.net): Eli Harrell, Dasha Aksenova, Wes Mahony, Christine Pang, Theo Belci, Alex Leeman
Max Turner

Cover photo:
Raphaël Lugassy
```

The theme splits the text at the "Contributors:" line: everything above goes into the description box, everything from it down goes into the CONTRIBUTORS box.

## T-shirts

**I ❤️ INSPO WHITE T-SHIRT**

SEO title: `I ❤️ Inspo White Tee, Hand-Printed in Paris`
SEO description: `White I ❤️ INSPO tee from Agent Issues 01. Hand-printed in Paris in a limited run on heavy 195 gsm cotton. Sizes S to L.`

Description:

```
The slogan from Issue 01 on a white tee. I ❤️ INSPO, for people whose camera roll is 90% screenshots.

We print each one by hand in Paris, so no two hearts sit the same. Limited run.
```

**I ❤️ INSPO BLACK T-SHIRT**

SEO title: `I ❤️ Inspo Black Tee, Hand-Printed in Paris`
SEO description: `Black I ❤️ INSPO tee from Agent Issues 01. Hand-printed in Paris in a limited run on heavy 195 gsm cotton. Sizes S to L.`

Description:

```
Same slogan, black tee. I ❤️ INSPO goes with everything you saved and never credited.

We print each one by hand in Paris, so the print shifts a little from shirt to shirt. Limited run.
```

The fabric and fit details move to the SPECS box (next section), and the size table is built into the theme.

## SPECS box

One-time setup: Settings → Custom data → Products → Add definition.
- Name: `Specs`
- Namespace and key: `custom.specs`
- Type: Multi-line text

Then fill it on each product, one `Label: value` per line.

**Issue 01** (fill in the lines marked `?`, or delete them):

```
Pages: 208
Format: 23 × 30 cm
Language: English
Season: FW25/26
Weight: 850 g
Paper: ?
Binding: ?
Print run: ?
```

**Both tees:**

```
Blank: Fruit of the Loom Heavy Cotton
Fabric: 100% cotton, 195 gsm
Fit: Classic, crew neck
Print: Hand-printed in Paris
Care: Machine wash, inside out
```

Shipping note under SPECS: Theme settings → Product pages → Shipping note. Empty until we write it (questions below).

## Alt text

Products → product → click a photo → Add alt text. In the order the photos appear in admin.

**Issue 01**
1. `Agent Issues Issue 01 'I ❤️ INSPO' front cover: a man in a patterned shirt walks down a street, photo by Raphaël Lugassy`
2. `Agent Issues Issue 01 back cover with a Lewis Dussurget ad`
3. `Issue 01 lying on a yellow street bollard`
4. `Issue 01 open on a lap at the moodboard pages of Mizuki Hirano and Mery Hoc`
5. `Issue 01 lying open on the Raphaël Lugassy story`
6. `Issue 01 spread: step-by-step photos of scissors cutting a paper snowflake`
7. `Issue 01 spread: photo collage from the Nastya Livadnova story`
8. `Issue 01 lying open on the Nastya Livadnova story`
9. `Issue 01 spread from A School for Fools, photography by Roman Mokrov: three women by a green pond, a man floats on a red mattress`

**White tee**
1. `White I ❤️ INSPO t-shirt laid flat, front`
2. `Model wearing the white I ❤️ INSPO t-shirt`
3. `White I ❤️ INSPO t-shirt, animated turn`

**Black tee**
1. `Black I ❤️ INSPO t-shirt, animated turn`
2. `Black I ❤️ INSPO t-shirt in motion`
3. `Model wearing the black I ❤️ INSPO t-shirt`
4. `Black I ❤️ INSPO t-shirt laid flat, front`

Until alt text is filled in, the theme falls back to the product title plus the photo number.

## Other brand-name fixes outside the theme

- Settings → General → Store name: `Agent Issues` (currently correct; check the email sender name too).
- Settings → Notifications: email templates may still say AAGENT+.
- Instagram bio and link-in-bio page.
