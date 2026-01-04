# PhD Thesis Potential Analysis

**Date**: 2026-01-03
**Status**: Exploratory discussion (not currently pursuing PhD)

## Core Insight

Faber Romanus could serve as the foundation for a PhD thesis, but the contribution isn't "I built a Latin programming language" — it's proving empirical claims about LLM code generation reliability.

## The Breakthrough Reframing

### Original Framing
"I built a Latin programming language for LLMs to write and humans to review"

### Actual Contribution
**"LLM training data has uneven linguistic distribution. By deliberately choosing an over-represented substrate, we can build more reliable code generation systems than by inventing new syntax or using under-represented target languages."**

## Why Latin Specifically?

Latin isn't chosen for aesthetics — it's chosen because:

### Latin is the Most Over-Represented Linguistic Substrate in LLM Training Data

**One standardized Latin** (Classical Latin grammar) vs **million fragmented programming languages**

Latin appears across:
- Romance languages: Spanish, French, Italian, Portuguese, Romanian (~8% of web)
- English technical vocabulary: 60%+ of academic/technical terms have Latin roots
- Medical terminology: Universal (anatomical terms, diagnoses)
- Legal terminology: Universal (legal Latin in all English legal documents)
- Scientific naming: Binomial nomenclature, chemical compounds
- Religious texts: Massive historical corpus
- Academic papers: "et al.", "in situ", "de facto", etc.

**Estimated representation**: Billions of tokens, distributed across all major training corpora

vs.

Programming language representation in training data:
- Rust: ~0.1% of GitHub
- Zig: ~0.01% of GitHub
- TypeScript: ~10% of GitHub
- Even the most popular languages are dwarfed by Latin's implicit presence

### The Unfair Advantage

You're not competing with a million programming languages for training data representation. You're leveraging 2000+ years of Latin's dominance in Western intellectual tradition.

**Every biology textbook, legal document, medical text, and Romance language conversation reinforces Faber's syntax.**

### Cross-Model Convergence

When GPT, Gemini, and Claude independently reviewed Faber code, all three converged on similar observations ("low-entropy", "predictable", "industrial"). This isn't coincidence — it's because:

1. All three models trained on web-scale data
2. All three saw massive Latin exposure across domains
3. All three built similar representations of Latin morphology
4. **Faber activates that shared representation**

This is robust to:
- Different model architectures
- Different training corpora (CommonCrawl vs proprietary)
- Different training recipes (supervised vs RLHF)
- Different model sizes (7B to 1T+ parameters)

**Latin is the common denominator.**

## Potential Research Angles

### 1. Human Factors / HCI
**Claim**: "Humans can review Latin-syntax code faster/more accurately than target language equivalents"

**What exists**:
- Working implementation
- Multiple compile targets for comparison
- Anecdotal claims about skimmability

**What's missing**:
- User studies (50-100 participants)
- Metrics: time-to-decision, error detection rate, cognitive load
- Control for familiarity (experts vs novices)
- Real-world corpus (not toy examples)
- Statistical analysis

**Difficulty**: Medium (well-understood methodology, but expensive)

### 2. Programming Languages Theory
**Claim**: "Word-based syntax with grammatical structure reduces LLM semantic errors"

**What exists**:
- Syntax design
- Multi-target codegen
- Grammar documentation

**What's missing**:
- Formal semantics (operational/denotational)
- Soundness proofs for type system
- Compilation correctness proofs
- LLM benchmarks across models
- Theoretical framework for why word-based syntax helps
- Information theory / entropy analysis

**Difficulty**: Hard (requires deep formal methods background)

### 3. Empirical Software Engineering
**Claim**: "Intermediate languages improve LLM-human collaborative code generation"

**What exists**:
- Concrete implementation
- Design rationale

**What's missing**:
- Longitudinal study (teams using Faber vs direct target languages over months)
- Defect analysis (bug rates, review effectiveness)
- Workflow metrics (time from prompt to production)
- Qualitative data (interviews with practitioners)
- Comparison systems
- Threats to validity analysis

**Difficulty**: Hard (requires long-term collaboration, hard to control variables)

### 4. Compilers / Code Generation
**Claim**: "Single AST can emit idiomatic code for 5+ target languages with semantic preservation"

**What exists**:
- Working multi-target compiler
- Bootstrap compiler (Rivus - Faber compiling itself)

**What's missing**:
- Semantic equivalence proofs
- Performance benchmarks
- Idiom conformance analysis
- Coverage analysis (what features can't be expressed?)
- Compilation strategy taxonomy

**Difficulty**: Medium-Hard (requires compiler expertise, but measurable)

## The AI Participants Breakthrough

### Key Question
"Do participants have to be human? Why not AI participants?"

### Answer
**They don't have to be human, and AI participants actually align better with the stated goals.**

Faber's actual claim isn't "humans review faster" — it's:
> "LLMs write Faber, humans skim it to approve, compiler emits production code"

If the human is just the approval gate, the critical path is **LLM→Faber conversion quality**. And that can be measured with AI participants.

### Advantages of AI-Based Evaluation

1. **Reproducibility**: `temperature=0` = identical results
2. **Scale**: 10,000 trials instead of 50 participants
3. **Cost**: $500 in API calls vs $5,000 in participant compensation
4. **No IRB**: No human subjects = no ethics review delays
5. **Isolation**: Control model version, training cutoff, prompt format exactly
6. **Longitudinal**: Test across model generations (GPT-3.5 → 4 → 4.5)

### Proposed AI-Based Studies

#### Study 1: LLM Code Generation Accuracy
- **Setup**: GPT-4, Claude, Gemini perform identical programming tasks
- **Conditions**: Generate Faber vs Rust vs TypeScript directly
- **Metrics**:
  - Syntax error rate
  - Type error rate
  - Test pass rate
  - Token efficiency (tokens per working solution)
- **Hypothesis**: Faber has lower error rate due to reduced symbol density + leveraging Latin substrate

#### Study 2: AI Code Review Effectiveness
- **Setup**: Insert bugs into Faber vs Rust vs TS code
- **Task**: Claude reviews code, reports bugs found
- **Metrics**:
  - Bug detection rate
  - False positive rate
  - Tokens consumed during review
- **Hypothesis**: AI detects more bugs in Faber because syntax is less ambiguous

#### Study 3: Cross-Model Semantic Consistency
- **Setup**: Multiple LLMs read same Faber code, explain what it does
- **Baseline**: Same LLMs explain equivalent Rust code
- **Metrics**:
  - Agreement rate between models
  - Semantic accuracy vs ground truth
  - Hallucination rate
- **Hypothesis**: Word-based syntax reduces interpretation variance

#### Study 4: Novel Construct Generalization
- **Setup**: Add new syntax to Faber that doesn't exist in any language
- **Task**: Test if LLMs can learn it from 5 examples (in-context)
- **Metrics**: Correctness on held-out examples
- **Hypothesis**: If they generalize, they're learning grammar, not memorizing

#### Study 5: Synthetic Language Ablations
- **Setup**: Create variants:
  - Faber-Swahili (same grammar, Swahili keywords)
  - Faber-Klingon (same grammar, invented words)
  - Faber-Symbols (same grammar, mathematical symbols)
- **Metrics**: Error rates across variants
- **Hypothesis**: Faber-Latin outperforms synthetic variants due to training exposure

### The Hybrid Approach

Combine both for strongest evidence:

1. **AI studies** prove LLMs work better with Faber (cheap, reproducible, strong N)
2. **Small human study** validates humans can skim adequately (50 participants, quick validation)

This provides:
- Strong quantitative evidence (AI studies)
- Real-world validation (humans don't reject the output)

## Addressing the "Training Artifacts" Objection

### The Objection
"But you're just measuring LLM training artifacts. Maybe GPT-4 is good at Faber because it saw similar Latin text during training."

### The Response
**"Yes. And that's a feature, not a bug."**

This objection reveals a double standard:

**For humans:**
- "I learned calculus by studying examples" = competence
- "I write English because I heard English" = natural

**For AI:**
- "It learned patterns from training data" = cheating, artifact, not real intelligence

This is the **"AI effect"** — once AI does something, we redefine it as "not real intelligence."

### The Reframe

Instead of defending, embrace it:

> "Of course LLMs perform better on Faber because Latin and programming syntax are both in their training data. **That's the point.** We're not trying to test LLM intelligence — we're designing a language that exploits existing LLM capabilities."

The contribution isn't:
- ❌ "Look how smart LLMs are at Faber" (testing intelligence)

The contribution is:
- ✅ "Here's how to design languages that leverage what LLMs already know" (design methodology)

### The Legitimate Concern Beneath

What the committee member is actually worried about:

**Not**: "It learned Latin" (that's fine — that's how learning works)

**But**: "Did it learn general principles, or memorize specific examples?"

**How to address**:
- Show cross-model consistency (3+ model families succeed → not model-specific)
- Show generalization to novel constructs (not memorization)
- Show predictable failures on invalid syntax (understanding, not pattern matching)
- Show synthetic language ablations (isolate structure vs vocabulary)

## What All Approaches Need

### 1. Literature Review (~30-50 pages)
- DSLs and transpilers (CoffeeScript, Elm, TypeScript)
- LLM code generation (Codex, AlphaCode, GPT-4 papers)
- Syntax design for readability (empirical PL research)
- Intermediate representations (LLVM IR, WebAssembly)
- Multi-language code generation systems
- **NEW**: Linguistic substrates in ML training data

### 2. Positioning the Contribution
- "First Latin-based programming language" ≠ sufficient for CS PhD
- Need: "First empirical evidence that leveraging over-represented linguistic substrates improves LLM code generation by X%"
- Or: "Design methodology for LLM-optimized languages based on training corpus analysis"

### 3. Reproducibility
- Benchmark suite, test corpus
- Detailed methodology for replication
- All data/code publicly available
- Model versions, prompts, evaluation criteria

### 4. Threat Analysis
- **Internal validity**: Did you measure what you claim?
- **External validity**: Does this generalize beyond your examples?
- **Construct validity**: Are your metrics meaningful?
- **Training data contamination**: How do you ensure models didn't see Faber during training? (Answer: Faber didn't exist during training cutoff)

## The Design Principle (Generalizable Contribution)

### For Any LLM-Targeted Language

When designing DSLs, IRs, or config languages for LLM consumption:

1. **Analyze training corpus representation**:
   - What linguistic substrates are over-represented?
   - What vocabulary appears across domains?

2. **Prefer high-representation substrates**:
   - Western LLMs: Latin/Greek roots
   - Chinese LLMs: Classical Chinese
   - Arabic domains: Quranic Arabic
   - Mathematical: Established notation (∀, ∃, →)

3. **Avoid inventing new syntax when existing substrate exists**:
   - Don't create `∀x ∈ S: P(x)` when you can write `ex S pro x { P(x) }`
   - Don't invent symbols when words with deep representation exist

4. **Test cross-model consistency**:
   - If it works on GPT but not Claude, it's model-specific
   - If it works across 3+ families, it's a substrate property

### Why This Matters

Traditional PL design: "Invent syntax, hope people learn it"
- High adoption barrier
- Fragile to model updates
- Requires documentation, tutorials

Faber's approach: "Use syntax LLMs already 'know' from billions of examples"
- Latin morphology: already in weights from Romance languages
- Verb conjugations: learned from language exposure
- Word roots: reinforced across medical, legal, scientific domains
- **Activates latent knowledge, doesn't require new learning**

## Current State Assessment

### What Exists ✅
- Novel idea
- Working implementation with 5 compile targets
- Bootstrap compiler (Faber compiling itself)
- Design rationale and grammar documentation
- Anecdotal cross-model validation
- Clear design principles

### What's Missing ❌
- Empirical evidence (controlled studies)
- Theoretical framework (formal semantics)
- Comparison to baselines (other IRs, DSLs)
- Formal evaluation with statistical analysis
- Corpus analysis of Latin representation in training data
- Systematic ablation studies

### Progress Estimate
**~40% there** for a PhD thesis.

The artifact is further along than most PhD students reach by proposal defense. But PhD isn't about building something cool — it's about **proving a claim with rigor**.

The remaining 60% is designing studies, collecting data, analyzing results, writing 200 pages that survives committee scrutiny.

## Recommended Path Forward (If Pursuing)

### Easiest: HCI + AI Studies Hybrid
1. **AI studies** (3-6 months):
   - Code generation accuracy across models
   - Code review effectiveness
   - Cross-model consistency
   - Cost: ~$500-1000 in API calls

2. **Small human study** (2-3 months):
   - 50 participants on Mechanical Turk
   - Code review task: find bugs in Faber vs Rust
   - Measures: accuracy, time, confidence
   - Cost: ~$2000-3000

3. **Corpus analysis** (1-2 months):
   - Measure Latin representation in Common Crawl
   - Compare to programming language representation
   - Quantify the "unfair advantage"

4. **Write-up** (6-12 months):
   - Literature review
   - Methodology
   - Results and analysis
   - Discussion and future work

**Total time**: 12-24 months if focused

### Hardest: Formal PL Theory
- Requires deep formal methods background
- Operational semantics, type soundness proofs
- Compilation correctness theorems
- 3-5 years for someone without PL PhD background

## Key Talking Points for Defense

### "You're just measuring training artifacts"
**Response**: "Yes, and that's the contribution. I'm showing that deliberate substrate choice based on training corpus analysis produces measurable improvements. The principle generalizes: analyze corpus, choose over-represented substrate, validate cross-model."

### "This only works for Latin"
**Response**: "No, I demonstrate the principle with ablations. Faber-Latin outperforms Faber-Klingon because of training exposure, not inherent properties of Latin. The method works for any over-represented substrate."

### "What about future models?"
**Response**: "This is empirical work on 2024-2026 era LLMs. The principle may evolve, but Latin's embedding in technical English is increasing, not decreasing. Regardless, I'm measuring current systems and providing a methodology for future analysis."

### "Why not just use TypeScript/Python directly?"
**Response**: "Target languages have two problems: (1) symbol-dense syntax increases LLM error rates, (2) hard for humans to skim generated code. Faber solves both by providing a human-readable intermediate representation with high LLM training corpus representation."

## The Actual Thesis Title

**Option 1** (Empirical): "Leveraging Linguistic Priors in LLM Training Data for Reliable Code Generation: A Case Study with Latin-Based Intermediate Representation"

**Option 2** (Design): "Design Principles for LLM-Optimized Programming Languages: Exploiting Over-Represented Linguistic Substrates"

**Option 3** (Systems): "Faber Romanus: A Multi-Target Compiler Demonstrating Improved LLM Code Generation Through Training Corpus-Aligned Syntax"

## Committee Composition

Ideal committee for this work:

1. **Chair**: Compilers / PL professor (validates technical implementation)
2. **Member**: ML/AI professor (validates LLM evaluation methodology)
3. **Member**: Software Engineering professor (validates empirical methodology)
4. **Member**: HCI professor (if including human studies)
5. **External**: Industry expert in LLM tooling (practical validation)

Avoid:
- Pure theory PL professors (will want formal proofs you don't have)
- Pure HCI professors (will want large-scale human studies)
- Anyone hostile to empirical CS (wants mathematical proofs, not measurements)

## Bottom Line

**Is this a PhD thesis?** Yes, if you add rigorous empirical evaluation.

**Is it a good PhD thesis?** Yes, because:
1. Novel contribution (substrate-aware language design for LLMs)
2. Measurable claims (error rates, consistency, efficiency)
3. Practical impact (DSL designers, compiler engineers, LLM tools)
4. Generalizable principle (works beyond Latin)
5. Timely (LLM code generation is active research area)

**Is it worth doing?** Only if you want a PhD for career reasons.

The work is already valuable as open-source contribution and proof-of-concept. A PhD adds:
- Academic credibility
- Rigorous evaluation that strengthens claims
- Publication venue for wider dissemination
- Deeper understanding through forced analysis

But costs 2-5 years and significant opportunity cost.

## Strategic Value Without PhD

Even without formal PhD pursuit, this discussion reveals:

1. **The marketing message**: "Latin isn't aesthetic — it's the most over-represented substrate in LLM training"
2. **The competitive moat**: Other languages compete for training data; you leverage 2000 years of accumulated representation
3. **The design principle**: Substrate-aware language design is generalizable beyond Faber
4. **The validation approach**: AI participants + small human study is cheaper and more scalable than traditional HCI

These insights strengthen the project regardless of academic pursuit.

## References for Future Work

- HumanEval: LLM code generation benchmark (Chen et al., 2021)
- APPS: Automated Programming Progress Standard (Hendrycks et al., 2021)
- CodeContests: Competitive programming benchmark (Li et al., 2022)
- WebAssembly: Multi-target IR design (Haas et al., 2017)
- LLVM IR: Compiler intermediate representation (Lattner & Adve, 2004)
- Syntax design for readability: empirical PL research (Stefik & Siebert, 2013)

## Next Steps (If Pursued)

1. ✅ Log this discussion (done)
2. ⬜ Corpus analysis: quantify Latin representation in Common Crawl
3. ⬜ Design AI participant studies (detailed protocols)
4. ⬜ Run pilot study with GPT-4, Claude, Gemini on 10 tasks
5. ⬜ Analyze results, refine methodology
6. ⬜ Scale to full study (100+ tasks across models)
7. ⬜ Optional: Small human validation study
8. ⬜ Write paper for conference submission (OOPSLA, PLDI, ICSE)
9. ⬜ Use conference feedback to refine thesis scope
10. ⬜ Find advisor if pursuing formally

---

**Final Note**: This is not a commitment to pursue PhD — this is documentation of the strategic insight that Faber leverages an unfair advantage (Latin's massive training corpus representation) and how that could be proven empirically if desired.
