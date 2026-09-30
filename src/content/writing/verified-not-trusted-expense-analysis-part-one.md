---
title: "Verified, Not Trusted: Expense Analysis, Part One"
description: >-
  Expense totals need verifiable source coverage and reproducible calculations.
  Two prompts show how parsing, category rules, refunds, and code shape the evidence.
datePublished: 2026-09-30
tags:
  - verified-not-trusted
  - verification
  - prompting
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

> I’ve attached a personal expense log covering June through August and some notes about my monthly budgets.
> Please organize the expenses by month and category, then calculate how much I spent in each category. Compare my dining and shopping expenses with the budgets in my notes and identify any important month-to-month changes or spending trends.
> Present the results in clear tables and summarize the three most important things I should know about my spending this quarter.

This is a reasonable request. It names the input, the time period, the comparisons, and the form of the answer. Someone reading it can understand the desired result.

It leaves several decisions unstated, including how to handle repeated entries, negative amounts, and descriptions that do not support a category. It also asks for totals without requiring code or a record of how the source lines became transactions.

A model might handle these issues correctly on its own. We should apply the same verification standard to either prompt's response: inspect the source coverage, decisions, and calculations. The prompt's length gives us no evidence that those checks have passed.

## The more precise prompt

> Attached is a running personal expense log (personal\_expenses.txt) and a short note on the two things I'm budgeting against (budget\_notes.txt). The log isn't structured — dates and formatting are inconsistent, there's no category field, and it's roughly but not strictly chronological.
>
> Before interpreting anything:
>
> 1. Parse every line into date, merchant/description, and amount. Flag any line you can't confidently parse.  
> 2. Assign each transaction a spending category based on the merchant. Where a transaction is genuinely ambiguous (a bank transfer or cash withdrawal with no description), don't force a category — flag it as uncategorized and tell me what it is.  
> 3. Check for likely duplicate entries and handle refunds/negative amounts correctly rather than treating them as ordinary purchases.  
> 4. Once the data is clean, use code to compute monthly totals by category, compare against the two budget targets, and find the largest month-over-month changes.  
> 5. Show me the computed tables before your interpretation.
>
> Don't estimate totals or do the arithmetic in your head — show the code. After the tables, tell me the three things you'd most want me to know about my spending this quarter.

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
