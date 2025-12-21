# Team Structure & Onboarding Guide

**Version:** 1.0  
**Created:** 2025-12-21  
**Last Updated:** 2025-12-21  
**Status:** Ready for Use

---

## Table of Contents

1. [Team Structure](#team-structure)
2. [Roles & Responsibilities](#roles--responsibilities)
3. [Hiring Requirements](#hiring-requirements)
4. [Onboarding Checklist](#onboarding-checklist)
5. [Access & Permissions](#access--permissions)
6. [Communication Channels](#communication-channels)
7. [Development Workflow](#development-workflow)
8. [Meeting Schedule](#meeting-schedule)
9. [Performance Expectations](#performance-expectations)

---

## Team Structure

### Organization Chart

```
                    ┌─────────────────┐
                    │  Product Owner  │
                    │   (Stakeholder) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Tech Lead     │
                    │  (Full-time)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌────────▼────────┐   ┌───────▼───────┐
│ Backend Team  │   │ Frontend Team   │   │ DevOps/QA     │
│ (3-4 devs)    │   │ (2-3 devs)      │   │ (2 devs)      │
└───────────────┘   └─────────────────┘   └───────────────┘
```

### Team Size by Phase

| Phase | Duration | Backend | Frontend | DevOps | QA | Design | Total |
|-------|----------|---------|----------|--------|-----|--------|-------|
| MVP (Phase 1) | 6 months | 3 | 2 | 1 | 1 | 1 (part-time) | 8-9 |
| Phase 2 | 6 months | 4 | 2 | 1 | 1 | 0.5 | 8-9 |
| Phase 3+ | 6 months | 4 | 3 | 1 | 2 | 0.5 | 10-11 |

---

## Roles & Responsibilities

### 1. Tech Lead

**Reports to:** Product Owner  
**Team Size Managed:** 7-10 developers

**Responsibilities:**
- Technical architecture decisions
- Code review and quality assurance
- Sprint planning and estimation
- Team mentoring and development
- Technical debt management
- Stakeholder communication
- Risk identification and mitigation

**Required Skills:**
- 8+ years software development experience
- 3+ years in leadership role
- Expert in Node.js/NestJS
- Experience with React Native
- Microservices architecture expertise
- Strong communication skills

**Key Metrics:**
- Sprint velocity
- Code quality (SonarQube score)
- Team satisfaction
- Technical debt ratio

---

### 2. Backend Developer (Senior)

**Reports to:** Tech Lead  
**Seniority:** Senior (5+ years)

**Responsibilities:**
- Design and implement microservices
- API development and documentation
- Database schema design
- Performance optimization
- Code review for junior developers
- Technical documentation

**Required Skills:**
- 5+ years backend development
- Expert in Node.js/TypeScript
- NestJS framework experience
- PostgreSQL/Redis expertise
- REST API design
- Understanding of GST/compliance (preferred)

**Key Metrics:**
- Story points completed
- Code review turnaround
- Bug escape rate
- Documentation quality

---

### 3. Backend Developer (Mid-Level)

**Reports to:** Tech Lead  
**Seniority:** Mid (3-5 years)

**Responsibilities:**
- Implement features based on specifications
- Write unit and integration tests
- Participate in code reviews
- Bug fixing and maintenance
- API documentation

**Required Skills:**
- 3+ years backend development
- Proficient in Node.js/TypeScript
- NestJS or Express experience
- SQL database experience
- Basic understanding of microservices

**Key Metrics:**
- Story points completed
- Test coverage
- Bug count

---

### 4. Frontend Developer (Senior - React Native)

**Reports to:** Tech Lead  
**Seniority:** Senior (5+ years)

**Responsibilities:**
- Lead mobile app development
- UI/UX implementation
- Offline-first architecture
- Performance optimization
- Mentor junior developers
- Cross-platform compatibility

**Required Skills:**
- 5+ years mobile development
- 3+ years React Native experience
- TypeScript expertise
- State management (Zustand/Redux)
- Native modules experience
- Offline-first architecture experience

**Key Metrics:**
- App performance metrics
- Crash-free rate
- Code review quality

---

### 5. Frontend Developer (Mid-Level - React Native)

**Reports to:** Senior Frontend Developer  
**Seniority:** Mid (2-4 years)

**Responsibilities:**
- Implement UI components
- Integrate APIs
- Write UI tests
- Bug fixing
- Accessibility implementation

**Required Skills:**
- 2+ years React Native experience
- JavaScript/TypeScript
- UI/UX sensibility
- Basic native development understanding

**Key Metrics:**
- Story points completed
- UI bug count
- Component reusability

---

### 6. DevOps Engineer

**Reports to:** Tech Lead  
**Seniority:** Mid-Senior (3-5 years)

**Responsibilities:**
- CI/CD pipeline management
- Infrastructure as Code (Terraform)
- Kubernetes cluster management
- Monitoring and alerting setup
- Security scanning and compliance
- Database administration
- Incident response

**Required Skills:**
- 3+ years DevOps experience
- AWS/GCP expertise
- Kubernetes administration
- Docker containerization
- CI/CD tools (GitHub Actions)
- Infrastructure as Code (Terraform)
- Monitoring tools (Prometheus, Grafana)

**Key Metrics:**
- Deployment frequency
- Mean time to recovery (MTTR)
- Infrastructure uptime
- Security scan pass rate

---

### 7. QA Engineer

**Reports to:** Tech Lead  
**Seniority:** Mid (3-5 years)

**Responsibilities:**
- Test planning and strategy
- Manual testing execution
- Automated test development
- Performance testing
- Security testing (basic)
- Bug tracking and reporting
- Regression testing

**Required Skills:**
- 3+ years QA experience
- Mobile app testing experience
- Automated testing (Detox, Appium)
- API testing (Postman, Jest)
- Performance testing basics
- SQL for data validation

**Key Metrics:**
- Test coverage
- Bug detection rate
- Regression test pass rate
- Test automation percentage

---

### 8. UI/UX Designer (Part-time/Contract)

**Reports to:** Product Owner  
**Engagement:** Part-time or Contract

**Responsibilities:**
- User research and personas
- Wireframing and prototyping
- Visual design
- Design system creation
- Usability testing
- Design handoff to developers

**Required Skills:**
- 3+ years UI/UX design
- Mobile app design experience
- Figma proficiency
- Design system experience
- Understanding of accessibility
- B2B/SaaS experience preferred

**Deliverables:**
- User flow diagrams
- Wireframes for all screens
- High-fidelity mockups
- Design system documentation
- Asset exports

---

## Hiring Requirements

### Immediate Hiring (Before Sprint 1)

| Role | Count | Priority | Timeline |
|------|-------|----------|----------|
| Tech Lead | 1 | P0 | Week 1 |
| Senior Backend Developer | 1 | P0 | Week 1-2 |
| Senior Frontend Developer | 1 | P0 | Week 1-2 |
| DevOps Engineer | 1 | P0 | Week 2 |
| UI/UX Designer | 1 (contract) | P0 | Week 1 |

### Phase 1 Hiring (Sprints 1-4)

| Role | Count | Priority | Timeline |
|------|-------|----------|----------|
| Mid Backend Developer | 2 | P1 | Sprint 2-3 |
| Mid Frontend Developer | 1 | P1 | Sprint 3 |
| QA Engineer | 1 | P1 | Sprint 4 |

### Job Description Templates

**Senior Backend Developer:**
```
Title: Senior Backend Developer (Node.js/NestJS)
Location: Remote/Hybrid
Experience: 5+ years

We're building a GST-compliant business management app for Indian SMEs. 
Looking for an experienced backend developer to design and build our 
microservices architecture.

Requirements:
- 5+ years backend development experience
- Expert in Node.js and TypeScript
- Experience with NestJS framework
- Strong PostgreSQL and Redis knowledge
- RESTful API design expertise
- Microservices architecture experience
- Understanding of Indian GST (nice to have)

What you'll do:
- Design and implement microservices
- Build GST-compliant invoicing system
- Create secure authentication system
- Optimize for performance and scale
- Mentor junior developers

Tech Stack: NestJS, PostgreSQL, Redis, Docker, Kubernetes, AWS
```

---

## Onboarding Checklist

### Day 1: Welcome & Setup

**Administrative:**
- [ ] Sign employment documents
- [ ] Receive equipment (laptop, accessories)
- [ ] Create company email account
- [ ] Setup password manager (1Password/Bitwarden)
- [ ] Receive welcome kit

**Communication:**
- [ ] Add to Slack workspace
- [ ] Add to relevant Slack channels
- [ ] Schedule intro meeting with Tech Lead
- [ ] Add to team calendar
- [ ] Share org chart and team contacts

**Access Requests:**
- [ ] GitHub organization invite
- [ ] Jira project access
- [ ] Confluence wiki access
- [ ] AWS console (if applicable)
- [ ] Figma team (if designer)

### Day 2-3: Technical Setup

**Development Environment:**
- [ ] Clone repository
- [ ] Follow DEVELOPMENT_SETUP.md guide
- [ ] Setup local development environment
- [ ] Run application locally
- [ ] Run test suite
- [ ] Complete first PR (README update or similar)

**Documentation Review:**
- [ ] Read PRD_DETAILED.md
- [ ] Read MVP.md
- [ ] Read PROJECT_ARCHITECTURE.md
- [ ] Read API_SPECIFICATIONS.md
- [ ] Read DATABASE_SCHEMA.md
- [ ] Review assigned module documentation

**Tool Setup:**
- [ ] Install VS Code with recommended extensions
- [ ] Configure ESLint and Prettier
- [ ] Setup Git with SSH key
- [ ] Install Docker Desktop
- [ ] Install Postman/Insomnia

### Week 1: Orientation

**Technical Deep Dive:**
- [ ] Architecture walkthrough with Tech Lead
- [ ] Codebase overview session
- [ ] Database schema review
- [ ] API design patterns discussion
- [ ] Coding standards review

**Process Training:**
- [ ] Sprint planning process
- [ ] Code review guidelines
- [ ] Git workflow (branching, commits)
- [ ] CI/CD pipeline overview
- [ ] Deployment process

**First Tasks:**
- [ ] Complete small bug fix or enhancement
- [ ] Participate in code review
- [ ] Attend first standup
- [ ] Shadow a senior developer

### Week 2-4: Ramp Up

**Ownership:**
- [ ] Assigned to first feature story
- [ ] Complete feature implementation
- [ ] Present work in sprint review
- [ ] Receive and act on feedback

**Integration:**
- [ ] 1-on-1 with Tech Lead
- [ ] Team feedback session
- [ ] Identify areas for growth
- [ ] Set 30-60-90 day goals

---

## Access & Permissions

### Access Matrix

| Tool | Tech Lead | Senior Dev | Mid Dev | DevOps | QA | Designer |
|------|-----------|------------|---------|--------|-----|----------|
| GitHub (Admin) | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| GitHub (Write) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Jira (Admin) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Jira (User) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AWS (Admin) | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| AWS (Read) | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Prod Database | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Staging Database | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Figma | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Sentry | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Analytics | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |

### Access Request Process

1. Submit access request in #access-requests Slack channel
2. Provide: Tool name, Access level, Business justification
3. Tech Lead approves/rejects within 24 hours
4. DevOps provisions access
5. Requester confirms access

### Security Guidelines

- Enable 2FA on all accounts
- Use SSH keys for GitHub (no passwords)
- Never share credentials
- Use password manager for all passwords
- Report lost/stolen devices immediately
- Log out from shared devices

---

## Communication Channels

### Slack Channels

| Channel | Purpose | Members |
|---------|---------|---------|
| #general | Company announcements | All |
| #engineering | Engineering discussions | Engineering team |
| #backend | Backend-specific topics | Backend team |
| #frontend | Frontend-specific topics | Frontend team |
| #devops | Infrastructure & deployments | DevOps + Leads |
| #code-reviews | Code review requests | Engineering team |
| #standup | Daily standup posts | Engineering team |
| #incidents | Production incidents | Engineering + DevOps |
| #random | Non-work discussions | All |

### Communication Guidelines

**Response Time Expectations:**
- Direct messages: 2-4 hours during work hours
- Channel mentions: 4-8 hours
- Non-urgent: End of day
- Urgent/Incidents: 15-30 minutes

**Best Practices:**
- Use threads for discussions
- Use @mentions sparingly
- Prefer async communication
- Document decisions in Confluence
- Use video calls for complex discussions

---

## Development Workflow

### Git Workflow

```
main (protected)
  │
  └── develop (integration branch)
        │
        ├── feature/BUSINESS-123-user-auth
        │
        ├── feature/BUSINESS-124-invoice-creation
        │
        └── bugfix/BUSINESS-125-tax-calculation
```

### Branch Naming Convention

```
feature/BUSINESS-XXX-short-description
bugfix/BUSINESS-XXX-short-description
hotfix/BUSINESS-XXX-critical-fix
refactor/BUSINESS-XXX-description
```

### Commit Message Format

```
type(scope): description

[optional body]

Closes BUSINESS-XXX
```

**Types:** feat, fix, docs, style, refactor, test, chore

**Example:**
```
feat(auth): implement OTP verification

- Add OTP generation with 6 digits
- Implement rate limiting (3/hour)
- Add SMS service integration

Closes BUSINESS-123
```

### Pull Request Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Self-review and fix linting issues
4. Create PR with description template
5. Request review from at least 1 reviewer
6. Address review comments
7. Get approval
8. Squash and merge to `develop`

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes BUSINESS-XXX
```

### Code Review Guidelines

**Reviewer Responsibilities:**
- Review within 24 hours
- Be constructive and specific
- Focus on logic, not style (let linters handle style)
- Approve if changes are acceptable
- Request changes if critical issues found

**Author Responsibilities:**
- Keep PRs small (<400 lines)
- Provide context in description
- Respond to feedback promptly
- Don't take feedback personally

---

## Meeting Schedule

### Daily Standup

**When:** Monday-Friday, 10:00 AM IST  
**Duration:** 15 minutes  
**Format:** Each person shares:
- What I did yesterday
- What I'm doing today
- Any blockers

### Sprint Planning

**When:** Every other Monday, 10:30 AM IST  
**Duration:** 2 hours  
**Agenda:**
- Review sprint goal
- Story breakdown
- Estimation (story points)
- Capacity planning
- Sprint commitment

### Sprint Review (Demo)

**When:** Every other Friday, 3:00 PM IST  
**Duration:** 1 hour  
**Agenda:**
- Demo completed features
- Stakeholder feedback
- Accept/reject stories

### Sprint Retrospective

**When:** Every other Friday, 4:00 PM IST  
**Duration:** 1 hour  
**Format:**
- What went well
- What didn't go well
- Action items

### Tech Sync

**When:** Wednesday, 2:00 PM IST  
**Duration:** 30 minutes  
**Agenda:**
- Technical discussions
- Architecture decisions
- Tech debt review

### 1-on-1 (with Tech Lead)

**When:** Bi-weekly  
**Duration:** 30 minutes  
**Topics:**
- Career development
- Feedback (both ways)
- Concerns/blockers
- Growth opportunities

---

## Performance Expectations

### Probation Period

**Duration:** 3 months

**Expectations:**
- Complete onboarding checklist
- Deliver assigned stories
- Participate in code reviews
- Attend all meetings
- Show positive attitude

**Review Criteria:**
- Code quality
- Productivity
- Communication
- Team collaboration
- Learning ability

### Ongoing Performance

**Sprint Metrics:**
- Story points completed vs committed
- Bug escape rate
- Code review turnaround
- On-call response time

**Quarterly Goals:**
- Technical skill development
- Process improvement contribution
- Knowledge sharing
- Team collaboration

### Growth Path

```
Junior Developer (0-2 years)
    │
    ▼
Mid-Level Developer (2-5 years)
    │
    ▼
Senior Developer (5-8 years)
    │
    ├── Staff Engineer (IC track)
    │
    └── Engineering Manager (Management track)
```

---

## Offboarding Checklist

When a team member leaves:

- [ ] Knowledge transfer sessions scheduled
- [ ] Documentation updated
- [ ] Code handover completed
- [ ] GitHub access removed
- [ ] Jira access removed
- [ ] AWS access removed
- [ ] Slack account deactivated
- [ ] Email forwarding setup
- [ ] Equipment returned
- [ ] Exit interview completed

---

**Document Status:** ✅ Complete  
**Last Updated:** 2025-12-21  
**Next Review:** Monthly
