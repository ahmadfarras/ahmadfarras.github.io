import { base } from '$app/paths';

export const companies = [
  {
    name: "Peruri",
    role: "Senior Backend Developer",
    dates: "August 2026 - Present",
    logo: `${base}/logos/peruri_logo.png`,
    description: `Backend developer for SmartASN, a national platform for Indonesian civil servants (ASN):
- Developed the social media feature in SmartASN, enabling civil servants to share posts and interact within the platform.
- Implemented privacy settings at both post and profile level, giving users control over who can see their content.
- Redesigned user profiles into two tabs: a LinkedIn-style professional profile, and an official employment profile sourced from BKN (National Civil Service Agency).
- Improved caching of BKN data, reducing load on external API calls and speeding up profile and content retrieval.

Tech stack: Go, PostgreSQL, Redis, Docker, MinIO`
  },
  {
    name: "PT. KlikCair",
    role: "Senior Backend Developer",
    dates: "November 2025 - August 2026",
    logo: `${base}/logos/klikcaircom_logo.jpeg`,
    description: `- Developed internal applications for customer loyalty and regulatory reporting to FDC (AFPI) and SLIK (OJK), ensuring accurate and timely data submission.
- Ensured backend compliance with ISO 27001, preparing technical documentation and security controls that helped the company pass certification.
- Migrated production servers from DigitalOcean to Alibaba Cloud, reducing infrastructure costs with minimal downtime.
- Set up comprehensive CI/CD pipelines and implemented Trunk Based Development (TBD), making the codebase more stable and maintainable while reducing merge conflicts across the team.
- Migrated project management from Jira to Plane, a self-hosted open-source alternative, giving the team full control over data and infrastructure while reducing licensing costs.

Tech stack: Go, MySQL, Docker, GitLab CI, Alibaba Cloud`
  },
  {
    name: "Paper.id",
    role: "Senior Software Engineer",
    dates: "May 2023 - October 2025",
    logo: `${base}/logos/paper_logo.jpeg`,
    description: `Backend engineer in the Financial Services business unit, building lending and card products and maintaining financial services legacy code.
- Built a Core Loan Management System from scratch, covering loan transactions, repayment schedules, settings, payments, and restructuring, serving as the foundation for Paper's virtual credit card product.
- Integrated with Mastercard to issue virtual credit cards using their ICCP and Notification modules.
- Core engineer behind Paper Pioneer Card and Paper Horizon Card, including physical card integration with MNC and QRIS payment integration with DOKU.
- Refactored legacy financing submission logic into a modular monolith architecture, improving code readability and maintainability, backed by unit tests.
- Integrated Privy digital signatures into the financing application flow.
- Documented APIs using the OpenAPI 3 (OAS3) standard and maintained bug fixes for Papercard.

Tech stack: Go (Gin, Chi), Node.js, RabbitMQ, Redis, Docker, Google Cloud Platform, Kubernetes`
  },
  {
    name: "PT. KlikCair",
    role: "Backend Developer",
    dates: "February 2022 - April 2023",
    logo: `${base}/logos/klikcaircom_logo.jpeg`,
    description: `Backend developer for DCB (Digital Community Banking), a digital banking application for rural banks (BPR), built with Spring Boot.
- Developed REST APIs using Spring Boot, each covered by integration tests and documented with Swagger.
- Integrated the application with BPR core banking APIs to enable digital banking transactions.
- Collaborated with mobile and web developers to integrate APIs and resolve issues across platforms.
- Contributed to infrastructure design discussions for new features and maintained bug fixes in production.

Tech stack: Java, Spring Boot, Swagger, RabbitMQ, Docker, Google Cloud Platform`
  },
  {
    name: "PT. Emerio Indonesia / PT. NTT Digital Solutions",
    role: "Java Developer • Jr Backend Developer",
    dates: "April 2018 - February 2022",
    logo: `${base}/logos/NTT_Data_2025.svg`,
    description: `Backend developer on client projects for major Indonesian banks and financial institutions.

BCA Finance
- Core engineer behind the FINA mobile application, developing REST APIs for web and mobile clients.
- Built a base application for scheduled jobs and resolved production issues, including notification bugs.

Bank BTPN Syariah
- Gathered client requirements and wrote Functional and Technical Specification Documents (FSD/TSD).
- Developed, maintained, and enhanced web applications, REST APIs, and databases.

Bank Central Asia (BCA)
- Developed REST APIs for web applications based on technical specifications.

Tech stack: Java, Spring Boot, Struts, Grails`
  }
];
