---
title: "Verified, Not Trusted: Expense Analysis, Part One"
titleEmphasis: "Verified, Not Trusted"
description: >-
  Expense totals need verifiable source coverage and reproducible calculations.
  Two prompts show how parsing, category rules, refunds, and code shape the evidence.
datePublished: 2026-09-30
dateModified: 2026-10-09
tags:
  - verified-not-trusted
  - verification
  - prompting
  - python
hero: verified-not-trusted-expense-analysis-part-one
related:
  - verified-not-trusted-expense-analysis-part-two
  - skills-versus-controlled-workflows
status: established
---

<!-- audit-allow: Verified, not trusted -->

## Comparing Two Prompts

***Verified, not trusted*** means checking the evidence behind an AI-generated answer before using it. For an expense total, that means checking which transactions were counted, how they were categorized, and whether the calculation reproduces the reported amount. A clear explanation or a tidy table is not enough to establish those facts.

We will give two prompts the same expense log and budget notes. Both ask for monthly spending, budget comparisons, and three findings. The first describes the answer we want. The second also specifies how to prepare the data, calculate the figures, and show the work behind them.

As we follow the example, keep one question in mind: Can we trace each conclusion back to the transactions and the rules that produced it?

<div class="article-callout" role="note" aria-label="Idea">
  <svg class="article-callout__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="/icons/callouts.svg#idea"></use></svg>
  <div class="article-callout__content">
    <p><strong>Instruction is not assurance.</strong></p>
    <p>An instruction in a prompt or a skill tells the model what to do. Two things can still go wrong:</p>
    <ol>
      <li>The model never does the requested work. We assume it did because we gave it the instruction.</li>
      <li>The model says it completed the work, but it did not follow every requirement of the instruction.</li>
    </ol>
    <p>We need evidence that the work was done and that it met the requirements. <strong><em>Verified, not trusted</em></strong> means checking both.</p>
  </div>
</div>

## The data and the task

The sample expense log covers June through August 2026. It is a text file, with 198 transaction entries. Dates and separators vary, some entries appear out of order, and there are no category labels. It also contains a repeated entry, a refund, and transfers with no stated purpose.

<details class="expense-example-output expense-example-input">
<summary>personal_expenses.txt (complete expense log)</summary>

```text
misc expenses - running list
(started keeping track of this after i realized i had no idea where money was going. not super consistent about it, some entries are from memory a day or two late. june through august.)

- June 1  Trader Joe's  $82.18
06-01: iCloud+ 200GB, 2.99
June 1 Amazon Prime $14.99
6/2: Xfinity Internet, $64.99
- 6/2  Shell  $24.97
- 6/2  Local Coffee Co  13.73
6/3/26 - Local Coffee Co - $11.35
Jun. 3 - Netflix - $15.49
Planet Fitness App (6/3/26) - 9.99
June 3: Verizon Wireless, $78.14
Trader Joe's (Jun. 4) - $35.72
6/4 Planet Fitness $67.82
June 4: Steam, 47.58
Jun. 4 Spotify Premium 11.99
- Jun 5  Aldi  $61.21
06-05: Spotify Concert, $55.28
Amazon (June 5) - $182.78
Best Buy, 2026-06-05 -- $56.99
Kroger, Jun. 6 -- $114.37
- 6/8/26  Kroger  $112.18
Jun. 7: Kroger, $21.78
Jun. 7 | Chevron | $33.58
AMC Theatres - $31.31 (June 6)
6/9: BP Gas, $30.24
2026-06-09 | Home Depot | $103.93
Jun 12: Lyft, $49.78
Jun. 12: Chipotle, $16.85
Local Coffee Co - 34.22 (2026-06-12)
McDonald's, June 10 -- $7.60
Rustic Tap Brewery - $8.37 (6/13)
Panera Bread, 06-13 -- $33.59
June 13 | Chevron | $20.97
6/13 | Target | $142.47
REI, 6/13/26 -- $189.97
Riverside Physical Therapy - $15.40 (6/13)
- 6/14/26  Costco  $29.04
Costco, Jun 15 -- $71.28
- 6/17  Riverside Physical Therapy  $94.67
Barnes & Noble (Jun. 17) - $29.02
Target - $62.34 (2026-06-18)
06-19 | Shell | $23.87
06-19 Old Navy $65.50
City Parking Authority (6/20/26) - 50.53
6/20/26 - Zelle Payment - $102.66
Costco (Jun 21) - $43.25
Uber (June 21) - $71.36
Jun 21 | Barnes & Noble | $31.68
6/21/26 - ATM Cash Withdrawal - $100.00
- Jun 22  City Parking Authority  $44.97
Jun 22: Home Depot, $45.36
Jun 24 - City Parking Authority - $21.44
6/24/26 Bowl-O-Rama 9.25
Jun 25 | Starbucks | $26.82
Jun. 25 - Uber - 62.41
Jun. 25: Old Navy, $110.73
Jun. 28: Sushi Kame, $37.51
- 2026-06-25  Venmo - Sam  $68.54
6/28/26 | Costco | $53.33
June 25: Riverside Physical Therapy, $73.82
Walgreens, 6/28 -- $92.54
Jun 30: Thai Orchid, $22.70
6/30/26 | City Parking Authority | 27.29
Panera Bread (07-01) - $24.42
Jul. 1 | Planet Fitness App | 9.99
7/1/26 - Xfinity Internet - $64.99
2026-07-02: Chipotle, $28.36
07-02 | Panera Bread | $7.22
7/2/26 IKEA $92.60
07-05 Netflix $15.49
07-02 Spotify Premium $11.99
- 2026-07-03  IKEA  $16.89
Jul. 2 | Planet Fitness | $73.58
Jul. 5 - iCloud+ 200GB - $2.99
Jul 6 | IKEA | $180.34
July 6: Spotify Concert, 15.09
Amazon Prime, 7/5 -- $14.99
July 5 | Verizon Wireless | $78.14
7/7/26 | Costco | $71.74
7/7/26 - Sushi Kame - $27.08
2026-07-07: Shell, $26.17
Jul 7 | Thai Orchid | $31.65
Jul 7 REI $109.19
- Jul 7  CVS Pharmacy  $26.14
2026-07-08: Aldi, $33.37
- 2026-07-08  Rustic Tap Brewery  $7.34
Jul 8: Local Coffee Co, $24.01
Chevron (07-08) - $27.99
Venmo - Sam, 7/9 -- $75.00
Shell, 2026-07-12 -- $51.20
Trader Joe's (07-13) - $108.54
Jul. 13 - City Parking Authority - $17.00
7/13: Target, $88.28
Jiffy Lube (Jul. 14) - $38.37
Jul 15 BP Gas $67.32
2026-07-16 - Kroger - $28.88
July 16 Trader Joe's $34.31
Riverside Physical Therapy - $66.26 (2026-07-16)
Costco (Jul. 17) - $38.97
7/17 | Whole Foods | $73.64
- Jul 18  Kroger  $142.20
Rustic Tap Brewery (2026-07-18) - $5.69
Jul. 18 - BP Gas - $63.54
Amazon (2026-07-18) - $141.82
Planet Fitness (Jul. 18) - 59.23
Return processed - REI (7/18/26) - -$68.00
07-21 - City Parking Authority - $14.30
AMC Theatres, July 22 -- $54.22
Trader Joe's (Jul. 22) - $54.12
Trader Joe's (Jul. 22) - $54.12
Costco, 2026-07-23 -- 113.92
Jul. 26: Best Buy, 195.60
Jul 28 Lyft $36.08
City Parking Authority, 07-28 -- $31.70
ATM Cash Withdrawal - $30.79 (Jul. 29)
Jul. 30 Bagel Corner $9.37
- 7/31  Walgreens  $45.96
7/31 | Trader Joe's | $129.51
- 2026-07-30  Spotify Concert  $45.24
Spotify Concert - $20.96 (7/31)
Netflix (8/2/26) - $15.49
08-01 | Xfinity Internet | $64.99
Aug 2: Zelle Payment, $120.00
Old Navy (2026-08-01) - $78.91
Costco (Aug 3) - $144.50
Amazon Prime (08-03) - $14.99
August 4 | Ticketmaster | 59.42
August 4 | McDonald's | $23.51
- 08-04  Sushi Kame  $8.81
Planet Fitness App, 8/4 -- $9.99
- Aug 5  Chipotle  $35.98
Rustic Tap Brewery - $24.22 (August 5)
Aug. 5: Spotify Premium, $11.99
2026-08-05: iCloud+ 200GB, $2.99
8/5 - Verizon Wireless - $78.14
BP Gas (2026-08-06) - $26.14
Starbucks - $34.66 (2026-08-07)
Dr. Hensley Dental Copay, Aug 7 -- $86.46
PayPal Transfer - $69.90 (08-07)
BP Gas (8/8) - $64.15
Costco - $45.07 (Aug 9)
8/9 Luigi's Pizza $26.02
Sushi Kame - $21.68 (8/9)
8/9: Amazon, $185.90
- Aug 9  Target  127.80
August 10 - Trader Joe's - $103.30
Aug. 10: Bagel Corner, $10.13
McDonald's (8/10/26) - $9.21
Costco - $89.78 (8/11/26)
Local Coffee Co - $11.95 (Aug. 11)
Sushi Kame (Aug 11) - $6.45
August 11 - Best Buy - $156.79
August 11 - Ticketmaster - 59.68
08-12 Kroger $129.67
Panera Bread, Aug. 12 -- $27.01
- 8/13  Whole Foods  $48.31
- 08-13  BP Gas  $53.78
Aug. 13 Shell $51.26
ATM Cash Withdrawal (8/13/26) - $79.84
Aug 14 - Starbucks - $8.05
2026-08-14: BP Gas, $21.80
Uber - $58.73 (08-14)
Aug 14: Amazon, $35.25
Walgreens - $13.77 (08-14)
Delta Air Lines - $412.60 (Aug. 14)
Delta Air Lines (8/14) - $450.60
Airport Parking - $68.00 (August 14)
August 15 | Marriott | $486.27
Hertz Rental Car - 214.35 (8/15/26)
8/16/26 - BP Gas - $13.36
Uber, August 16 -- $24.10
August 17 REI $132.82
8/17/26 - Barnes & Noble - $77.40
8/18: Luigi's Pizza, $29.46
8/20/26 - Kroger - $19.18
Costco - 107.35 (Aug 20)
BP Gas (08-20) - $35.79
- 08-20  Barnes & Noble  $78.98
IKEA, 2026-08-21 -- $68.71
Whole Foods (8/23/26) - $43.94
- 8/23  Chipotle  $36.19
BP Gas (08-24) - $51.86
08-26: Planet Fitness, $54.19
2026-08-26 Rustic Tap Brewery $34.67
Chevron (8/26) - 63.74
Aug. 25 - Aldi - $58.15
Aug 27 - Whole Foods - $38.03
08-27 Costco 18.99
Luigi's Pizza, Aug 27 -- $23.00
2026-08-27: Lyft, 32.33
Old Navy, 08-27 -- $92.34
Panera Bread - $27.69 (August 28)
8/29/26 Trader Joe's $136.52
City Parking Authority, 8/30/26 -- $20.43
Aug 30: Shell, $21.94
Chevron - $23.17 (Aug 30)
2026-08-31 Best Buy 183.41
Ticketmaster - $41.78 (August 31)
8/31 | Riverside Physical Therapy | $68.38
```

</details>

The second file, `budget_notes.txt`, tells us what the person wants to monitor:

```text
budget-ish notes to self

not tracking everything against a number, just the two things that actually
worry me:

- eating out / coffee: want to keep this under $260 a month. it's been
  creeping up and i don't think i'm noticing it day to day.
- amazon/shopping in general: it's probably my biggest category overall but
  i've got more slack there, roughly $1200/month is fine, just want to keep
  an eye on it so it doesn't quietly become $2000.

everything else (groceries, gas, subscriptions, etc) i'm not budgeting
against a specific number right now, just want to see where it's going.
```

These files have different jobs. The expense log supplies the transactions. The budget notes supply two targets: a monthly dining limit of $260 and a rough shopping target of $1,200. They supply no numerical budget for groceries, gas, or the other categories.

We want monthly category totals, comparisons with those two targets, and three findings about the changes. Let's start by asking for that directly.

## The standard prompt

```text
I’ve attached a personal expense log covering June through August and some notes about my monthly budgets.
Please organize the expenses by month and category, then calculate how much I spent in each category. Compare my dining and shopping expenses with the budgets in my notes and identify any important month-to-month changes or spending trends.
Present the results in clear tables and summarize the three most important things I should know about my spending this quarter.
```

This is a reasonable request. It names the input, the time period, the comparisons, and the form of the answer. Someone reading it can understand the desired result.

It leaves several decisions unstated, including how to handle repeated entries, negative amounts, and descriptions that do not support a category. It also asks for totals without requiring code or a record of how the source lines became transactions.

A model might handle these issues correctly on its own. But if it returns a table and three findings, we still need to know what happened between the request and that answer.

## What happens between the prompt and the answer?

The language models used in chat generate text a piece at a time. Each piece is a **token**, which can be a word, part of a word, or punctuation. The model predicts how likely possible next tokens are, given the instructions, supplied material, and text already generated. A generation method selects a token, adds it to the text, and repeats.

This is called **autoregressive** generation: each new piece becomes part of the context for the next one. Selection can take the most likely token or sample among possible tokens, so repeated requests can produce different responses. [Hugging Face's text-generation guide](https://huggingface.co/docs/transformers/llm_tutorial) describes this process.

A more precise prompt guides that generation by making the requested behavior clearer. A sentence such as "I checked every transaction" still needs evidence behind it. Repeating the same answer would not establish correctness either.

When the chat application provides a code-execution tool, the model can request a calculation, the application runs the code, and the result comes back to the model. The model can then continue using that result. We need to inspect both the calculation and the answer built from it.

That is the purpose of the next prompt. It makes the preparation steps explicit and asks for code and computed tables so we have something to inspect before accepting the findings.

## The more precise prompt

<div class="article-callout" role="note" aria-label="Idea">
  <svg class="article-callout__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="/icons/callouts.svg#idea"></use></svg>
  <div class="article-callout__content">
    <p>Make the hidden decisions explicit.</p>
  </div>
</div>

```text
Attached is a running personal expense log (personal_expenses.txt) and a short note on the two things I'm budgeting against (budget_notes.txt). The log isn't structured — dates and formatting are inconsistent, there's no category field, and it's roughly but not strictly chronological.

Before interpreting anything:

1. Parse every line into date, merchant/description, and amount. Flag any line you can't confidently parse.
2. Assign each transaction a spending category based on the merchant. Where a transaction is genuinely ambiguous (a bank transfer or cash withdrawal with no description), don't force a category — flag it as uncategorized and tell me what it is.
3. Check for likely duplicate entries and handle refunds/negative amounts correctly rather than treating them as ordinary purchases.
4. Once the data is clean, use code to compute monthly totals by category, compare against the two budget targets, and find the largest month-over-month changes.
5. Show me the computed tables before your interpretation.

Don't estimate totals or do the arithmetic in your head — show the code. After the tables, tell me the three things you'd most want me to know about my spending this quarter.
```

## What the added instructions do

The improvement is specific: this prompt tells the model how to turn the text into a set of transactions, what to do with problems in the data, and what evidence to show. Let's follow those instructions before looking at the response.

### Name the inputs and explain their condition

> "Attached is a running personal expense log (personal_expenses.txt) and a short note on the two things I'm budgeting against (budget_notes.txt)."

This opening supplies **context**: which files to use and what each contributes. Spending comes from the log; budget targets come from the notes.

> "Dates and formatting are inconsistent, there's no category field, and it's roughly but not strictly chronological."

These details explain what preparation is needed. The model must read several date formats, add categories, and group transactions by their dates. A line's position in the file is insufficient evidence of its month.

### Set the order of work

> "Before interpreting anything:"

This introduces a **sequence**: prepare the transactions and calculate the figures before drawing conclusions. A large travel purchase may catch our attention immediately. We still need the complete totals before saying what explains a month's increase.

The numbered steps describe that order. They remain instructions for the model to follow; numbering them does not make the application enforce the sequence.

<span id="check-the-instructions-against-actual-lines"></span>

### 1. Account for every source line

> "Parse every line into date, merchant/description, and amount."

**Parse** means read the text and extract its fields. For example:

```text
Best Buy, 2026-06-05 -- $56.99
```

This becomes a transaction dated June 5, 2026, with merchant Best Buy and amount $56.99. The named fields give every transaction the same structure despite the varied source formats.

"Every line" requires complete coverage. Difficult transactions must not disappear. The heading and introductory note need to be identified as non-transaction text, and extracted transactions must remain traceable to their source lines.

### 2. Make parsing uncertainty visible

> "Flag any line you can't confidently parse."

When a date, description, or amount is unclear, show the source line and the field needing clarification. That gives us a problem we can resolve. A guessed value or a silently omitted transaction could otherwise be hidden inside a plausible total.

### 3. Preserve unknown categories

> "Assign each transaction a spending category based on the merchant."

This asks for a consistent mapping, such as Trader Joe's to Groceries. Choosing the mapping involves judgment: knowing the store does not tell us everything purchased there. Stating the rules makes those choices inspectable.

> "Don't force a category" and "flag it as uncategorized and tell me what it is."

Consider this entry:

```text
Venmo - Sam, 7/9 -- $75.00
```

The date and amount are readable, but the payment's purpose is unknown. Assigning it to Dining would invent a fact. "Uncategorized" preserves that uncertainty. "Tell me what it is" keeps the $75 and its description visible for follow-up.

### 4. Check duplicates and refunds

> "Check for likely duplicate entries and handle refunds/negative amounts correctly"

The log contains this pair:

```text
Trader Joe's (Jul. 22) - $54.12
Trader Joe's (Jul. 22) - $54.12
```

Both lines parse successfully. Counting both could inflate July groceries by $54.12. "Likely" matters: they could represent two real purchases. Flagging the pair and explaining the decision lets us check the assumption behind the total.

The refund presents a different problem:

```text
Return processed - REI (7/18/26) - -$68.00
```

Some hyphens separate fields; the minus sign before the amount changes its meaning. For net spending, this line subtracts $68 from July shopping. Reading it as a positive purchase makes the total $136 higher: adding $68 instead of subtracting $68. The instruction calls attention to a sign that must survive cleanup.

### 5. Calculate after preparing the data

> "Once the data is clean, use code to compute monthly totals by category"

"Once" makes calculation depend on the prepared transactions. Removing a duplicate or changing a category afterward requires recalculation, so the table uses the corrected data.

"Use code" specifies the method: group and sum the prepared records by month and category using executable calculations we can inspect and run again.

> "Compare against the two budget targets, and find the largest month-over-month changes."

"The two" ties the comparison to the budget notes: dining against $260 a month and shopping against roughly $1,200. It does not authorize a new grocery budget. "Month-over-month" means comparing June with July, then July with August. "Largest" still needs a choice: the biggest dollar change and the biggest percentage change may identify different categories. The response should state its measure.

### 6. Show evidence before conclusions

> "Show me the computed tables before your interpretation."

This sets the **output order**: inspect the figures before reading the explanation. "Computed" ties the tables to the calculation's results.

> "Don't estimate totals or do the arithmetic in your head" and "show the code."

These are a **constraint** on the method and a request to show it. Displayed code alone does not prove that it ran or that its results reached the tables.

> "After the tables, tell me the three things you'd most want me to know about my spending this quarter."

This bounds the final **task**: choose three useful findings supported by the figures, with the person's dining and shopping concerns in mind. Selecting them requires judgment.

Together, these clauses give us a clearer process and more work to inspect. They also give us specific requirements against which to check the response.

## Who carries out these steps?

Notice that this prompt describes a sequence of steps. Parsing comes before categorization, cleanup comes before calculation, and the tables come before the interpretation. Coordinating those steps, their inputs, and what happens after each result is **orchestration**.

The **controller** carries out that orchestration. Here, the model is the controller. The prompt supplies instructions, and the model chooses the actions to request, examines their results, and decides what to do next. That repeated process is the **control loop**. Asking the model to use Python inside one step leaves the model in charge of the surrounding orchestration.

## The recorded response

Here is the response and the supplied code from a run with the more precise prompt. Look for its treatment of the duplicate, refund, and unknown-purpose transfers. Then check whether the code carries out the requested steps. These excerpts show what happened in one run; they do not establish how reliably either prompt works.

<details class="expense-example-output">
<summary>Recorded model output</summary>

I treated the **REI return on July 18 as −$68.00 against Shopping**. I also removed one of the two identical **Trader Joe’s $54.12 entries on July 22** as an apparent duplicate. If both were real purchases, add $54.12 to July groceries and the July/quarter totals.

### Spending by category

| Category | June | July | August | Quarter |
| --- | --- | --- | --- | --- |
| Groceries | $624.34 | $829.20 | $982.79 | **$2,436.33** |
| Dining & coffee | $212.74 | $165.14 | $398.69 | **$776.57** |
| Shopping | $1,020.77 | $756.72 | $1,218.31 | **$2,995.80** |
| Transportation | $461.41 | $373.67 | $562.58 | **$1,397.66** |
| Travel | $0.00 | $0.00 | $1,631.82 | **$1,631.82** |
| Health & fitness | $354.24 | $281.16 | $232.79 | **$868.19** |
| Entertainment | $143.42 | $135.51 | $160.88 | **$439.81** |
| Utilities & telecom | $143.13 | $143.13 | $143.13 | **$429.39** |
| Subscriptions | $45.46 | $45.46 | $45.46 | **$136.38** |
| Cash & transfers\* | $271.20 | $105.79 | $269.74 | **$646.73** |
| **Total** | **$3,276.71** | **$2,835.78** | **$5,646.19** | **$11,758.68** |

\* Zelle, Venmo, PayPal transfers, and ATM withdrawals are kept separate because the log does not say what the money ultimately paid for. They may not all represent additional consumption, so the overall total should be interpreted with that caveat.

I classified Walgreens/CVS under **Health & fitness**, rather than Shopping. Amazon Prime is a subscription; ordinary Amazon purchases are Shopping.

### Your two budget areas

| Month | Dining & coffee | $260 budget | Shopping | \~$1,200 guideline |
| --- | --- | --- | --- | --- |
| June | $212.74 | **$47.26 under** | $1,020.77 | **$179.23 under** |
| July | $165.14 | **$94.86 under** | $756.72 | **$443.28 under** |
| August | $398.69 | **$138.69 over** | $1,218.31 | **$18.31 over** |
| **Quarter** | **$776.57** | **$3.43 under $780** | **$2,995.80** | **$604.20 under $3,600** |

The dining quarter total is interesting: **you came in almost exactly at the three-month budget**, but the monthly behavior is very different. June and July created enough room to absorb August.

### Month-to-month changes

| Category | June → July | July → August |
| --- | --- | --- |
| Dining & coffee | **−22.4%** | **+141.4%** |
| Shopping | **−25.9%** | **+61.0%** |
| Groceries | **+32.8%** | **+18.5%** |
| Total logged spending | **−13.5%** | **+99.1%** |

August's overall jump is heavily influenced by **$1,631.82 of travel**: two Delta charges, Marriott, Hertz, and airport parking. So the near-doubling of total spending isn't simply normal spending getting out of control.

### The three things I'd pay attention to

1. **Dining is the clearest budget warning.** June and July were comfortably below $260, but August hit **$398.69**, a 141% increase from July. Your quarter still looks fine at $776.57 versus $780, but that hides the August change. If August becomes the new normal, dining would run about **$1,664 over budget annually**.
2. **Shopping is sizeable, but it isn't quietly becoming $2,000/month.** You averaged about **$998.60/month** across the quarter. August crossed your \~$1,200 guideline by only $18.31, and the quarter as a whole was about **$604 below** the corresponding $3,600 guideline. The REI refund is correctly reducing this category.
3. **Groceries show the strongest sustained upward trend outside your budgeted categories.** They went **$624 → $829 → $983**, an increase of about **57% from June to August**. Unlike the August travel spike, this happened progressively across all three months. Since dining also jumped in August, the higher grocery spending did **not** appear to substitute for eating out that month.

So the area I'd watch most closely in September is **food overall**: groceries plus dining went from **$837 in June → $994 in July → $1,381 in August**. That is a much stronger trend than looking at dining alone.

</details>

<details class="expense-example-output">
<summary>Recorded code and intermediate output</summary>

The following code and intermediate output were supplied from the same interactive chat. They show data preparation, category assignments, removal of the repeated entry, totals, and percentage changes. The original assignment to `raw` and the code for the budget comparisons were not included in these excerpts.

Replaying the supplied code against the original expense file reproduced all 44 cells in the category totals table and all nine percentage calculations below, after excluding the file's two introductory lines. That leaves 198 transaction entries before removing the repeated entry and 197 afterward. This preparation is necessary: retaining the introductory lines shifts the row numbers, moves some expenses into the wrong month, and makes `df.drop(index=108)` remove a $54.22 AMC Theatres charge instead of the $54.12 Trader Joe's entry. The replay establishes how to reproduce the recorded figures; it does not establish how `raw` was prepared in the original chat.

Months are assigned by line position rather than by parsing each transaction's date. The reproduced results therefore depend on the input order and the stated category and duplicate decisions. The code and output below are preserved as supplied.

```python
lines=[l.strip() for l in raw.splitlines() if l.strip()]
# Find transition indices
for i,l in enumerate(lines):
    if "Panera Bread (07-01)" in l or "Netflix (8/2/26)" in l:
        print(i,l)
```

```python
import re, pandas as pd, numpy as np, math
def amt(line):
    ms=re.findall(r'(?<!\d)(-?)\$?(\d+\.\d{2})(?!\d)',line)
    # there should be at least one; use first occurrence because only amount decimal
    if not ms: return None
    sign,num=ms[0]
    return (-1 if sign=='-' else 1)*float(num)

def merchant(line):
    keys=[
        "Trader Joe's","iCloud+ 200GB","Amazon Prime","Xfinity Internet","Shell","Local Coffee Co",
        "Netflix","Planet Fitness App","Verizon Wireless","Planet Fitness","Steam","Spotify Premium","Aldi",
        "Spotify Concert","Amazon","Best Buy","Kroger","Chevron","AMC Theatres","BP Gas","Home Depot","Lyft",
        "Chipotle","McDonald's","Rustic Tap Brewery","Panera Bread","Target","REI","Riverside Physical Therapy",
        "Costco","Barnes & Noble","Old Navy","City Parking Authority","Zelle Payment","Uber","ATM Cash Withdrawal",
        "Bowl-O-Rama","Starbucks","Sushi Kame","Venmo - Sam","Walgreens","Thai Orchid","IKEA","CVS Pharmacy",
        "Jiffy Lube","Whole Foods","Bagel Corner","Ticketmaster","Dr. Hensley Dental Copay","PayPal Transfer",
        "Luigi's Pizza","Delta Air Lines","Airport Parking","Marriott","Hertz Rental Car"
    ]
    # special refund REI
    for k in keys:
        if k in line:
            return k
    return "Unknown"

cats={}
for m in ["Trader Joe's","Aldi","Kroger","Costco","Whole Foods"]: cats[m]="Groceries"
for m in ["Local Coffee Co","Chipotle","McDonald's","Rustic Tap Brewery","Panera Bread","Starbucks","Sushi Kame","Thai Orchid","Bagel Corner","Luigi's Pizza"]: cats[m]="Dining & coffee"
for m in ["Amazon","Best Buy","Home Depot","Target","REI","Barnes & Noble","Old Navy","IKEA"]: cats[m]="Shopping"
for m in ["Shell","Chevron","BP Gas","Lyft","Uber","City Parking Authority","Jiffy Lube"]: cats[m]="Transportation"
for m in ["iCloud+ 200GB","Amazon Prime","Netflix","Spotify Premium"]: cats[m]="Subscriptions"
for m in ["Spotify Concert","Steam","AMC Theatres","Bowl-O-Rama","Ticketmaster"]: cats[m]="Entertainment"
for m in ["Planet Fitness App","Planet Fitness","Riverside Physical Therapy","Dr. Hensley Dental Copay","Walgreens","CVS Pharmacy"]: cats[m]="Health & fitness"
for m in ["Xfinity Internet","Verizon Wireless"]: cats[m]="Utilities & telecom"
for m in ["Delta Air Lines","Airport Parking","Marriott","Hertz Rental Car"]: cats[m]="Travel"
for m in ["Zelle Payment","Venmo - Sam","PayPal Transfer","ATM Cash Withdrawal"]: cats[m]="Cash & transfers"

rows=[]
for i,l in enumerate(lines):
    month="June" if i<62 else ("July" if i<119 else "August")
    m=merchant(l); a=amt(l)
    rows.append([i,month,l,m,a,cats.get(m,"Other")])
df=pd.DataFrame(rows,columns=["idx","month","line","merchant","amount","category"])
df[df.merchant=="Unknown"], df[df.amount.isna()]
```

```text
(Empty DataFrame
 Columns: [idx, month, line, merchant, amount, category]
 Index: [],
 Empty DataFrame
 Columns: [idx, month, line, merchant, amount, category]
 Index: [])
```

```python
df[(df.month=="July") & (df.merchant=="Trader Joe's")][["idx","line","amount"]]
```

```text
     idx                             line  amount
89    89   Trader Joe's (07-13) - $108.54  108.54
95    95      July 16 Trader Joe's $34.31   34.31
107  107  Trader Joe's (Jul. 22) - $54.12   54.12
108  108  Trader Joe's (Jul. 22) - $54.12   54.12
116  116    7/31 | Trader Joe's | $129.51  129.51
```

```python
df2=df.drop(index=108).copy()
pivot=df2.pivot_table(index="category",columns="month",values="amount",aggfunc="sum",fill_value=0)
pivot=pivot[["June","July","August"]]
pivot["Quarter"]=pivot.sum(axis=1)
pivot.loc["TOTAL"]=pivot.sum(axis=0)
pivot.round(2)
```

```text
month                   June     July   August   Quarter
category
Cash & transfers      271.20   105.79   269.74    646.73
Dining & coffee       212.74   165.14   398.69    776.57
Entertainment         143.42   135.51   160.88    439.81
Groceries             624.34   829.20   982.79   2436.33
Health & fitness      354.24   281.16   232.79    868.19
Shopping             1020.77   756.72  1218.31   2995.80
Subscriptions          45.46    45.46    45.46    136.38
Transportation        461.41   373.67   562.58   1397.66
Travel                  0.00     0.00  1631.82   1631.82
Utilities & telecom   143.13   143.13   143.13    429.39
TOTAL                3276.71  2835.78  5646.19  11758.68
```

```python
totals=pivot.loc["TOTAL",["June","July","August"]]
changes={
"total_Jul_vs_Jun":(totals["July"]/totals["June"]-1)*100,
"total_Aug_vs_Jul":(totals["August"]/totals["July"]-1)*100,
"groceries_Jul_vs_Jun":(pivot.loc["Groceries","July"]/pivot.loc["Groceries","June"]-1)*100,
"groceries_Aug_vs_Jul":(pivot.loc["Groceries","August"]/pivot.loc["Groceries","July"]-1)*100,
"groceries_Aug_vs_Jun":(pivot.loc["Groceries","August"]/pivot.loc["Groceries","June"]-1)*100,
"dining_Jul_vs_Jun":(pivot.loc["Dining & coffee","July"]/pivot.loc["Dining & coffee","June"]-1)*100,
"dining_Aug_vs_Jul":(pivot.loc["Dining & coffee","August"]/pivot.loc["Dining & coffee","July"]-1)*100,
"shop_Jul_vs_Jun":(pivot.loc["Shopping","July"]/pivot.loc["Shopping","June"]-1)*100,
"shop_Aug_vs_Jul":(pivot.loc["Shopping","August"]/pivot.loc["Shopping","July"]-1)*100,
}
changes
```

```text
{'total_Jul_vs_Jun': np.float64(-13.456485316063993),
 'total_Aug_vs_Jul': np.float64(99.10536078257128),
 'groceries_Jul_vs_Jun': np.float64(32.8122497357209),
 'groceries_Aug_vs_Jul': np.float64(18.522672455378686),
 'groceries_Aug_vs_Jun': np.float64(57.41262773488802),
 'dining_Jul_vs_Jun': np.float64(-22.374729717025488),
 'dining_Aug_vs_Jul': np.float64(141.42545718784066),
 'shop_Jul_vs_Jun': np.float64(-25.867727303898036),
 'shop_Aug_vs_Jul': np.float64(60.99878422666243)}
```

</details>

## What still needs a rule or a check

The second prompt leaves some choices open. It does not supply a fixed category list, define the exact duplicate rule, or specify whether a displayed overall total should include uncategorized transfers and cash withdrawals. Those choices can change the answer even when every addition is correct.

For example, the log has two August purchases at Barnes & Noble: $77.40 and $78.98. Together they total $156.38. Treating bookstores as Shopping rather than Entertainment moves that amount between categories. The prompt does not choose between those rules.

Even when the model states its rules and flags uncertainty, we must check for omissions, misread fields, and unsupported categories. Naming a requirement in the prompt does not establish that the response meets it.

Verification has a defined scope. We can check that the tables agree with the supplied log under stated category rules. That does not establish that the log contains every real-world expense or that each merchant-based category describes what was actually purchased. Missing evidence must remain a limit on the conclusion.

## How to compare the responses

Give each prompt the same expense log and budget notes, in a fresh conversation with the same model and tools. Save the full responses. That gives us a comparison of what happened in those runs. Claims about how reliably either prompt works require repeated tests.

Review both responses against the same checks:

- Every transaction line is accounted for, with parsing problems and exclusions explained
- The repeated Trader Joe's entries are flagged, with their treatment stated
- The REI refund keeps its negative sign
- Transfers and cash withdrawals with no known purpose remain visible as uncategorized
- The category rules, code, and tables agree
- Dining and shopping are compared with the two stated monthly targets
- Each finding can be traced to the relevant transactions and computed totals

These checks give ***Verified, not trusted*** a practical meaning: account for the entries, reproduce the totals, and check the findings against them. State any dependency on an unresolved category or possible duplicate.

## The stakes and the person in the loop

There are two dimensions to consider: the consequences of an error, and whether a person verifies the work before its result is used.

At one end, you are using a prompt or skill to explore your household expenses. You are sitting there, checking the entries, double-checking the tallies, and asking for corrections. You want to understand your budget. The stakes are low, and a human is in the loop. A prompt or skill can be perfectly reasonable for that job.

At the other end, a large organization wants to automate its expense accounting. The results feed business records and decisions, and nobody checks each run before it proceeds. The stakes are high, and the pipeline is fully automated. I would not put that responsibility in the hands of a model-controlled prompt. The accounting has to be correct. An occasional wrong total is a failure, however convincing the explanation around it may be.

| | Personal budgeting | Automated organizational accounting |
| --- | --- | --- |
| Consequences of an error | Limited consequences while exploring a household budget | Incorrect records and consequential business decisions |
| Human verification | A person checks entries and tallies before using the result | Nobody reviews each execution before its result proceeds |
| Control and checks | A prompt or skill directs the model; the person verifies the work | Application code enforces required steps and checks before accepting a result |

Those are the two extremes. High stakes can still involve a human reviewer, and low-stakes work can run unattended. Increasing the stakes demands stronger evidence. Removing the reviewer means the application must perform the checks that person would otherwise perform. Watching an answer appear is not verification.

## What remains under the model's control?

The second prompt is much more explicit about the work we want. But the model still controls whether it requests a tool call, what it sends to that tool, and what it does with the response. A numbered sequence of instructions does not enforce those actions.

There is another responsibility hidden in “use code.” We are asking the model to generate Python during the run. We must inspect that code as well as establish that it executed. Python will happily execute an incorrect calculation. Successful execution tells us nothing by itself about whether every expense was included or every rule was applied.

We have a concrete example above. The prompt asks for each transaction's date to be parsed, but the recorded code assigns months by line position. Its duplicate removal also depends on the input having been prepared in a particular way. The replay reproduces the figures under those conditions. It does not turn those shortcuts into a general implementation of the instructions.

Even within a prompt-based approach, I would rather supply calculation code that we have written, reviewed, and tested, and explicitly instruct the model to use it without generating a replacement. That removes the need to invent the implementation during each run. It still leaves the model controlling the call and the use of its result.

Suppose our tested function returns $398.69 for August dining. The execution record shows that it ran with the intended inputs and returned that value. Have we established that the final report uses $398.69? No. The model could write $389.69, use a total from before a correction, or compare a different value with the budget. A correct function can return the correct answer while the overall workflow delivers the wrong one.

That is why I want evidence for the whole chain: the intended operation ran, it received the intended inputs, its result met the requirements, and the later calculations and report used that result. A tool call is one link in that chain.

Models can follow these instructions very well. The problem is the run in which one step goes wrong. We do not know in advance which run that will be, and a history of good answers does not verify the next answer. For unattended work with serious consequences, I will not accept “it usually gets it right” as the basis for correctness.

These actions and results can be checked through execution records, retained inputs, and comparisons with the delivered output. The prompt itself establishes none of them, and the model's assurance that it followed the prompt is insufficient. ***Verified, not trusted*** applies to the orchestration as well as the arithmetic.

## From instructions to a repeatable workflow

For the automated end of that spectrum, I want imperative code to be the controller. The application must call the required operations, pass their results to the next steps, and enforce the checks that permit work to continue. Models can still help with interpretation and classification inside that flow. Their contributions must pass the application's checks before being used.

We have to test that application code too. If a refund was counted as a purchase, keep the input and expected signed result as a regression test. Run it when the relevant implementation changes. That gives the correction a lasting check instead of another instruction we hope the model remembers.

A skill can invoke this maintained workflow. The important questions are who controls its execution and who verifies the result. Packaging the instructions as a skill does not answer either question by itself.

Part two takes up these remaining responsibilities: enforcing the sequence, preserving the inputs and returned values, checking model contributions, and building the report from checked results. In [Verified, Not Trusted: Expense Analysis, Part Two](/writing/verified-not-trusted-expense-analysis-part-two/), we first explain how imperative orchestration changes control of the work, then follow a Python implementation through the expense analysis.
