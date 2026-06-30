Phase Planning Workflow

## Overview

Phase planning in this GSD system creates executable PLAN.md files that guide teams through structured implementation. The workflow orchestrates research, planning, verification, and execution phases with integrated feedback loops.

### Workflow Components

| Component | Purpose | Key Output |
|-----------|---------|------------|
| `gsd-plan-phase` | Main orchestrator | PLAN.md files with executable tasks |
| `gsd-phase-researcher` | Technical research | RESEARCH.md for planning context |
| `gsd-planner` | Create execution plans | PLAN.md files |
| `gsd-plan-checker` | Validate plans | Verification of plan quality |

### Planning Process

1. **Initialize Phase** - Validate phase, create directory, load context
2. **Load CONTEXT.md** - User's decisions from discuss-phase
3. **Research Phase** - Technical investigation (optional)
4. **Create Plans** - Detailed execution plans with tasks
5. **Verify Plans** - Quality checking and validation
6. **Present Results** - Save PLAN.md and show next steps

## Phase Planning Command

### Basic Usage

```bash
/gsd-plan-phase <phase-number>
```

### Parameters

`<phase-number>` - Phase number from roadmap (1, 2, 3, etc.)

### Flags

**Research Control**
```bash
--research              Force re-research even if RESEARCH.md exists
--skip-research         Skip research, go straight to planning
--gaps                 Gap closure mode (skips research, uses VERIFICATION.md)
--skip-verify           Skip verification loop entirely
```

**Content Loading**
```bash
--prd <file>            Load from PRD file instead of CONTEXT.md
--reviews               Replan with cross-AI review feedback
--text                  Use plain-text numbered lists (for remote sessions)
```

**Automation**
```bash
--auto                  Auto-advance after planning
--chain                 Auto-advance to plan+execute
```

## Phase Planning File Structure

### PLAN.md Files

Phase planning generates executable PLAN.md files in the phase directory:

```
.planning/
├── phases/
│   └── {padded_phase}-{phase-slug}/
│       ├── PLAN.md              # Main execution plan
│       ├── RESEARCH.md         # Technical research (optional)
│       ├── VALIDATION.md       # Verification requirements
│       ├── UI-SPEC.md          # UI design (if frontend)
│       └── CONTEXT.md          # Phase context from discuss-phase
```

### PLAN.md Format

```markdown
---
plan_name: Brief description
goal: Phase objective
wave: Number (1=parallel, >1=sequential)
depends_on: Other phase dependencies
category: Required/Optional/Suggestive
autonomous: Boolean (execution autonomy)
files_modified: []
---
<task_id>
read_first:
  - file1
  - file2
acceptance_criteria:
  - Condition to verify
  - Multiple conditions allowed

<task_id>
read_first:
  - source1
acceptance_criteria:
  - Exact string must be present
  - File must exist

<task_id>
read_first:
  - existing_config
acceptance_criteria:
  - Command output check
  - Return code verification
```

## Phase Planning Workflow

### 1. Phase Initialization

**Step 1: Validate Phase**
- Verify phase exists in ROADMAP.md
- Extract phase metadata (name, goal, requirements)
- Create phase directory if needed

**Step 2: Context Loading**
- Load existing CONTEXT.md (decisions from discuss-phase)
- Parse CONFIG.md preferences
- Prepare for research and planning

### 2. Research Phase

**Technical Investigation**
- Research phase goals and requirements
- Identify implementation patterns and constraints
- Document alternatives and trade-offs

**When Research Is Required**
- New feature areas
- Unfamiliar technologies
- Complex integrations
- Architecture decisions

**Research Skip Options**
- Skip research: Plan directly from context
- Re-research: Force new technical investigation

### 3. Plan Creation

**Planner Integration**
- Spawn `gsd-planner` agent with CONTEXT.md and RESEARCH.md
- Generate executable tasks with concrete actions
- Include verification criteria for each task

**Plan Quality Gates**
- All tasks have `<read_first>`, `<acceptance_criteria>`, `<action>`
- Full requirements coverage
- Dependencies correctly identified
- Acceptance criteria are verifiable with grep/file commands

### 4. Plan Verification

**Quality Assurance**
- Spawn `gsd-plan-checker` agent
- Verify plan quality against standards
- Check requirements coverage
- Validate task effectiveness

**Verification Loop**
- Maximum 3 iterations
- Address issues before proceeding
- User choices for resolution
- Fallback on rollback if needed

### 5. Output Presentation

**Final Status**
```bash
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► PHASE {X} PLANNED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase {X}: {Name} — {N} plan(s) in {M} wave(s)

| Wave | Plans | What it builds |
|------|-------|----------------|
| 1    | 01, 02 | [objectives]  |
| 2    | 03     | [objective]   |

Research: {Completed | Used existing | Skipped}
Verification: {Passed | Passed with override | Skipped}

▶ Next Up

**Execute Phase {X}** — run all {N} plans

/clear then:

/gsd-execute-phase {X}
```

## Example Usage

### Basic Phase Planning
```bash
/gsd-plan-phase 1
```

### Auto-Advance to Execution
```bash
/gsd-plan-phase 1 --chain
```

### Gap Closure Mode
```bash
/gsd-plan-phase 1 --gaps
```

### Research-First Approach
```bash
/gsd-plan-phase 1 --research
```

### Use PRD Instead of Context
```bash
/gsd-plan-phase 1 --prd my-PRd.md
```

## Integration with GSD Workflow

### Phase Planning in Overall GSD Flow

1. **Discuss Phase** - Capture design decisions (CONTEXT.md)
2. **Plan Phase** - Create executable plans (PLAN.md)
3. **Execute Phase** - Run tasks and verify results

### Decision Gates

**Phase Validation**
- Phase must exist in ROADMAP.md
- All requirements mapped to the phase
- CONTEXT.md provides implementation decisions

**Research Gate**
- Technical feasibility determined
- Implementation patterns identified
- Alternative approaches documented

**Planning Gate**
- All phase requirements covered
- Plans are executable and testable
- Quality standards maintained

**Verification Gate**
- Plans pass quality checks
- All acceptance criteria met
- Implementation feasibility confirmed

## Planning Best Practices

### Code Quality
- Create concrete, actionable tasks
- Reference existing patterns
- Include verification steps
- Use exact values and specifications

### Documentation
- Document assumptions in plans
- Track decisions and changes
- Maintain traceability
- Update CONTEXT.md

### Testing
- Create testable acceptance criteria
- Use grep/file verification
- Include command output checks
- Verify file existence

## Planning Troubleshooting

### Common Issues

1. **Research Blocking**
   - Cause: Technical uncertainty
   - Solution: Extend research or provide guidance

2. **Planning Loops**
   - Cause: Missing requirements
   - Solution: Revise approach or adjust scope

3. **Quality Failures**
   - Cause: Incomplete specifications
   - Solution: Gather more requirements

### Resolution Strategies

1. **Agent Failures**
   - Check available resources
   - Verify dependencies
   - Reset and retry

2. **Plan Issues**
   - Review acceptance criteria
   - Revise actions
   - Test execution

## Available Planning Commands

### Quick Start
```bash
/gsd-plan-phase 1 --auto
```

### Manual Planning
```bash
/gsd-plan-phase 1 --skip-research
```

### Gap Closure
```bash
/gsd-plan-phase 1 --gaps
```

### Re-search
```bash
/gsd-plan-phase 1 --research
```

### View Plans
```bash
cat .planning/phases/{phase-dir}/*-PLAN.md
```

## Phase Planning Checklist

### Pre-Planning
- [ ] Phase validated against roadmap
- [ ] CONTEXT.md loaded and applied
- [ ] Available dependencies confirmed
- [ ] Research requirements identified

### During Planning
- [ ] Research completed (if applicable)
- [ ] Plans created with quality gates
- [ ] Verification performed
- [ ] User feedback incorporated

### Post-Planning
- [ ] Plans committed to git
- [ ] STATE.md updated
- [ ] Status communicated
- [ ] Next steps defined

## Planning Workflow Summary

Phase planning in this system follows a structured approach:

1. **Load Context** - Use CONTEXT.md from discuss-phase
2. **Research (if needed)** - Technical investigation
3. **Create Plans** - Executable PLAN.md files with tasks
4. **Verify Plans** - Quality checking and validation
5. **Present Results** - Save plans and show next steps

The workflow ensures that all decisions are captured in CONTEXT.md, technical research informs planning, and plans are executable and verifiable before execution.

**Planning enables execution by providing clear, actionable steps with verification criteria.**