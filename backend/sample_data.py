from sqlalchemy.orm import Session
import models
import json

def create_sample_data(db: Session):
    if db.query(models.Agent).count() > 0:
        return
    
    # Sample AI Agents
    agents = [
        models.Agent(
            name="Email Assistant Pro",
            category="email",
            description="Automatically responds to customer emails with personalized, professional replies. Handles FAQs, support requests, and general inquiries.",
            icon="📧",
            price_monthly=299.00,
            tasks_included=5000,
            features=json.dumps([
                "Auto-respond to emails",
                "Sentiment analysis",
                "Priority detection",
                "Multi-language support",
                "Custom tone settings"
            ]),
            is_popular=True,
            total_purchases=247,
            rating=4.8
        ),
        models.Agent(
            name="Meeting Scheduler AI",
            category="scheduling",
            description="Automatically schedules meetings by analyzing calendars and finding optimal times. Sends invites and handles rescheduling.",
            icon="📅",
            price_monthly=199.00,
            tasks_included=3000,
            features=json.dumps([
                "Calendar integration",
                "Timezone handling",
                "Conflict resolution",
                "Auto-reminders",
                "Meeting prep summaries"
            ]),
            is_popular=True,
            total_purchases=189,
            rating=4.9
        ),
        models.Agent(
            name="Data Entry Bot",
            category="data_entry",
            description="Extracts data from documents, invoices, and forms. Automatically populates spreadsheets and databases with 99% accuracy.",
            icon="📊",
            price_monthly=399.00,
            tasks_included=10000,
            features=json.dumps([
                "OCR technology",
                "Multi-format support",
                "Auto-validation",
                "Duplicate detection",
                "Batch processing"
            ]),
            is_popular=False,
            total_purchases=156,
            rating=4.7
        ),
        models.Agent(
            name="Customer Support Agent",
            category="support",
            description="24/7 AI customer support that handles common questions, troubleshooting, and escalates complex issues to humans.",
            icon="💬",
            price_monthly=499.00,
            tasks_included=15000,
            features=json.dumps([
                "24/7 availability",
                "Multi-channel support",
                "Knowledge base integration",
                "Escalation logic",
                "Satisfaction tracking"
            ]),
            is_popular=True,
            total_purchases=312,
            rating=4.9
        ),
        models.Agent(
            name="Content Writer AI",
            category="content",
            description="Generates blog posts, social media content, and marketing copy. SEO-optimized and brand-voice trained.",
            icon="✍️",
            price_monthly=249.00,
            tasks_included=2000,
            features=json.dumps([
                "SEO optimization",
                "Brand voice training",
                "Multi-platform formats",
                "Plagiarism check",
                "Content calendar"
            ]),
            is_popular=False,
            total_purchases=203,
            rating=4.6
        ),
        models.Agent(
            name="Lead Research Bot",
            category="research",
            description="Finds and qualifies leads automatically. Scrapes LinkedIn, company websites, and databases to build prospect lists.",
            icon="🔍",
            price_monthly=599.00,
            tasks_included=5000,
            features=json.dumps([
                "Lead scoring",
                "Contact enrichment",
                "Company research",
                "Email verification",
                "CRM integration"
            ]),
            is_popular=True,
            total_purchases=178,
            rating=4.8
        ),
        models.Agent(
            name="Invoice Processor",
            category="data_entry",
            description="Automatically processes invoices, extracts line items, and updates accounting software. Handles approvals and payments.",
            icon="💰",
            price_monthly=349.00,
            tasks_included=8000,
            features=json.dumps([
                "Auto-extraction",
                "Approval workflows",
                "Payment scheduling",
                "Expense categorization",
                "Audit trails"
            ]),
            is_popular=False,
            total_purchases=134,
            rating=4.7
        ),
        models.Agent(
            name="Social Media Manager",
            category="content",
            description="Plans, creates, and schedules social media posts across all platforms. Analyzes engagement and optimizes timing.",
            icon="📱",
            price_monthly=279.00,
            tasks_included=4000,
            features=json.dumps([
                "Multi-platform posting",
                "Engagement analytics",
                "Hashtag optimization",
                "Content calendar",
                "Competitor analysis"
            ]),
            is_popular=False,
            total_purchases=167,
            rating=4.5
        )
    ]
    
    for agent in agents:
        db.add(agent)
    
    db.commit()
