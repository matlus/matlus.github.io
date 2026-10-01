---
title: "Verified, Not Trusted: Expense Analysis, Part One"
description: >-
  Expense totals need verifiable source coverage and reproducible calculations.
  Two prompts show how parsing, category rules, refunds, and code shape the evidence.
datePublished: 2026-09-30
dateModified: 2026-10-01
tags:
  - verified-not-trusted
  - verification
  - prompting
  - python
hero: verified-not-trusted-expense-analysis-part-one
status: established
---

## Comparing Two Prompts

Verified, not trusted means checking the evidence behind an AI-generated answer before using it. For an expense total, that means checking which transactions were counted, how they were categorized, and whether the calculation reproduces the reported amount. A clear explanation or a tidy table is not enough to establish those facts.

This exercise uses two prompts to analyze the same expense log. Both ask for monthly spending, budget comparisons, and three findings. The second also specifies how the model should prepare the data and calculate the results before interpreting them.

Each total depends on earlier decisions: which lines become transactions, what their amounts mean, and how they are categorized. A table alone does not show whether those decisions were sound. A more precise prompt makes more of the work available to check.

The question throughout the exercise is: Can we trace each conclusion back to the transactions and the rules that produced it?

## The data and the task

The expense log covers June through August 2026. It was prepared for this teaching exercise and includes inconsistent date formats, missing category labels, a repeated entry, a refund, and transfers with no stated purpose.

The accompanying budget notes name only two targets: keep eating out and coffee under $260 a month, and keep shopping around $1,200 a month. The second is a rough target. Neither note creates a budget for every other category.

The task is to organize the transactions, compute monthly category totals, compare dining and shopping with those targets, and explain the main changes.

## The standard prompt

```text
I’ve attached a personal expense log covering June through August and some notes about my monthly budgets.
Please organize the expenses by month and category, then calculate how much I spent in each category. Compare my dining and shopping expenses with the budgets in my notes and identify any important month-to-month changes or spending trends.
Present the results in clear tables and summarize the three most important things I should know about my spending this quarter.
```

This is a reasonable request. It names the input, the time period, the comparisons, and the form of the answer. Someone reading it can understand the desired result.

It leaves several decisions unstated, including how to handle repeated entries, negative amounts, and descriptions that do not support a category. It also asks for totals without requiring code or a record of how the source lines became transactions.

A model might handle these issues correctly on its own. We should apply the same verification standard to either prompt's response: inspect the source coverage, decisions, and calculations. The prompt's length gives us no evidence that those checks have passed.

The next step is to make those hidden decisions explicit. Start with what determines a total: how each source line is read and counted, what remains uncertain, and how duplicates and refunds are treated. Then ask for code and computed results that let us check the calculation. This gives the second prompt a clear purpose: specify the work we need to inspect before accepting its conclusions.

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

## What the added instructions do

Each clause has a specific job. It asks for work that supports verification, or sets a requirement we can check. The explanation below each clause separates requesting that work from checking that it happened.

### 1. Account for every source line

> “Parse every line into date, merchant/description, and amount.”

**What this changes:** This makes coverage part of the task. The model has to consider every source line and extract the same fields. To verify coverage, we still need a way to match each transaction to its source line and explain any excluded text, such as the log's heading.


### 2. Make parsing uncertainty visible

> “Flag any line you can't confidently parse.”

**What this changes:** This asks the model to expose reading problems before calculating. A date or amount it cannot read with confidence should remain visible as an issue. The instruction gives uncertainty a place in the result, although we still have to check for problems the model failed to flag.


### 3. Preserve unknown categories

> “Where a transaction is genuinely ambiguous” and “flag it as uncategorized”

**What this changes:** This separates reading a transaction from knowing its purpose. A transfer may have a clear date and amount but no known spending purpose. Keeping it uncategorized preserves that limit.


### 4. Check duplicates and refunds

> “Check for likely duplicate entries and handle refunds/negative amounts correctly”

**What this changes:** This names two data problems that can change totals. The model should identify a possible duplicate and explain how it treated it. A refund must retain its negative sign when calculating net spending. “Likely” matters: matching entries are evidence to inspect, not proof that one should be deleted.


### 5. Calculate after preparing the data

> “Once the data is clean, use code to compute monthly totals by category”

**What this changes:** This puts calculation after parsing, categorization, and cleanup, and requests executable arithmetic. Verified, not trusted applies to both inputs and calculations: review the cleaned transactions and category rules, then run the code and check that it reproduces the reported totals.


### 6. Show evidence before conclusions

> “Show me the computed tables before your interpretation” and “show the code.”

**What this changes:** These instructions ask for evidence that can be inspected before accepting the conclusions. Displaying code does not prove that it ran or produced the tables. We need to check that the code uses the supplied data and that its output agrees with the reported results.


The order matters. If a duplicate is removed after a table has been calculated, the table must be recomputed. If a transaction changes category, the relevant category totals and budget comparisons must change with it. The findings depend on the final, corrected tables.

## Check the instructions against actual lines

The log contains this repeated pair:

```text
Trader Joe's (Jul. 22) - $54.12
Trader Joe's (Jul. 22) - $54.12
```

Keeping both entries adds $54.12 more than keeping one. A useful response should flag the pair, state whether it counts one or both, and explain the assumption. Removing a line silently prevents us from checking that decision.

The refund appears as:

```text
Return processed - REI (7/18/26) - -$68.00
```

The punctuation matters. Some hyphens separate fields, while the minus sign before the amount changes its meaning. Under a net-spending calculation, this entry subtracts $68 from July shopping. Reading it as a positive $68 purchase would make the total $136 higher than the correct signed treatment.

An ambiguous transfer is recorded as:

```text
Venmo - Sam, 7/9 -- $75.00
```

We can read its date, description, and amount. The line does not say what the payment was for. Calling it dining, shopping, or groceries would add information that the source does not provide. It should remain uncategorized until its purpose is known.

Cleaning needs care because the decisions affect different parts of the calculation. Removing a duplicate changes which entries are counted, while correcting a refund's sign changes the net amount. Categorization determines where that amount appears in the report.

## What still needs a rule or a check

The second prompt leaves some choices open. It does not supply a fixed category list, define the exact duplicate rule, or specify whether a displayed overall total should include uncategorized transfers and cash withdrawals. Those choices can change the answer even when every addition is correct.

Merchant-based categorization has limits. A merchant name may support a useful working category, but it does not establish what was purchased. The category rules should be stated and applied consistently. Unknown-purpose amounts should be shown separately so they are not mistaken for verified spending in a known category.

For example, the log has two August purchases at Barnes & Noble: $77.40 and $78.98. Together they total $156.38. Treating bookstores as Shopping rather than Entertainment moves that amount between categories. The prompt does not choose between those rules.

The request to find the “largest month-over-month changes” also needs interpretation. Largest by dollar amount and largest by percentage can identify different changes. A response should say which measure it uses, or show both where they are useful.

More instructions make these decisions easier to discuss and test. They do not establish that the model followed them. An answer can contain code, tables, and confident explanations while still omitting a line or using an unsupported category.

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

These checks give “verified, not trusted” a practical meaning. Confidence in a total comes from accounting for the source entries and reproducing the calculation. Confidence in a finding comes from checking it against those totals. A result that still depends on an unresolved category or possible duplicate should state that dependency.

## From instructions to a repeatable workflow

The more precise prompt spells out work that the standard prompt leaves to the model. It helps us ask for evidence and identify decisions that need review. Verified, not trusted applies to this prompt too: we must check the evidence, reproduce the calculations, and limit the findings to what the data supports.

Part two will move these steps into a coded workflow. It will examine which operations can be controlled by the application, where classification still requires judgment, and how to check the result before presenting findings.
