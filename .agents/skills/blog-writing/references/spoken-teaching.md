# Voice and sequencing from spoken teaching

These observations come from two raw transcripts sampled from Shiv's Google Drive on October 3, 2026, alongside his explicit guidance about teaching forceful rules. They supplement the original blog samples. This is a focused sample, not a review of the entire transcript collection. Transcripts reveal emphasis, anticipated objections, and the order of explanation; speech fillers and recognition errors are not style requirements.

These examples show one aspect of the voice. Use the broader range in [voice-and-flow.md](voice-and-flow.md) to choose a pace and approach suited to the current article. The principles illustrated here transfer across subjects; the technical positions below belong to their original arguments.

## Establish the principle, then develop its meaning

In **Programming To Exceptions**, the opening strongly establishes the author's stance on throwing and catching exceptions. The talk develops why exceptions matter before returning to specific handling responsibilities. Later passages explain handling at entry points, translating specific provider exceptions, and rolling back a transaction before rethrowing.

The opening gives the audience a clear principle to think about. Later examples supply distinctions as they become useful. Preserve that sequence when it serves the article. Do not move every exception into the opening or dilute the principle simply because later detail exists. A qualification needed to identify the rule's scope still belongs with the rule.

Source: raw transcript titled **Programming To Exceptions - raw transcript**. The Matlus repository also holds `docs/source-material/programming-to-exceptions-raw-transcript.txt`. Locate the opening discussion of throwing and catching, then the later discussion of entry points, translation, and transaction rollback. These are voice observations; current implementation advice requires the task's technical evidence.

## Anticipate the objection at the example that answers it

In **Let's Talk - Separate State from Behavior - Yes PLEASE!**, Shiv begins with his position and his experience of maintaining systems. He connects that experience to the difficulty other team members face understanding the design. The explanation then introduces immutable data objects and behavior classes.

When the discussion reaches a behavior class with properties, he anticipates the reader's objection: how can this class be stateless if it has properties? He explains the references to other behavior classes while examining that example. The distinction has a concrete purpose at that moment. It helps the reader understand what he means by statelessness without turning the introduction into a list of qualifications.

The talk also returns to a team-coordination analogy to explain responsibility and orchestration. A repeated idea can do new teaching work when the reader now has more context. Keep that useful return while editing out false starts and spoken detours that obscure the written explanation.

Source: raw transcript titled **Let's Talk - Separate State from Behavior - Yes PLEASE! - raw transcript**. Locate the immutable DTO discussion, the Movie Manager example with references to other behavior classes, and the team-coordination analogy. Personal experiences in this transcript belong to this argument; do not invent matching experiences for other subjects.

## Apply the author's clarification

Shiv explicitly wants strong opinions and purposeful questions preserved. A rule should give the reader a clear direction. Explain an exceptional case when its reason matters to the lesson; do not append hypothetical caveats merely because exceptions could exist. Preserve accuracy and intended scope while letting the main point land.

Two examples supplied directly by Shiv clarify how to apply this:

- **"Action or command methods do but do not return."** Teach that statement plainly. A creation operation returning the new customer's identifier is a particular case to explain later when relevant. Do not immediately append it to the rule or soften the rule preemptively.
- **Get and search have different purposes.** Get promises the requested customer and throws an exception if that customer cannot be found. Search expresses uncertainty about whether a matching customer exists. "What if I want to search?" introduces a different operation and contract; it is not an exception to get. Preserve that distinction in the article instead of inventing a nullable-get compromise.

These examples record the author's intended teaching and terminology. Apply that fidelity to the supplied argument; they are not permission to impose method contracts on unrelated codebases. When reviewing an apparent caveat, first ask whether it is a genuine special case of the same operation or a different operation whose purpose needs a separate explanation.
