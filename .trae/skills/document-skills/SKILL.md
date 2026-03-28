---
name: "document-skills"
description: "A comprehensive documentation skill for creating high-quality project documentation. Use this skill when you need to write READMEs, API docs, architecture diagrams, or technical guides."
origin: "travisjneuman/.claude"
---

# Document Skills

A comprehensive guide for creating high-quality project documentation.

## When to Activate

- Creating or updating a `README.md`
- Writing API documentation
- Documenting architecture or system design
- Creating user guides or tutorials
- Writing contribution guidelines
- Documenting code changes or release notes

## Documentation Types

### 1. README.md

The entry point to your project. Should answer:
- What is this project?
- Why is it useful?
- How do I get started?

**Structure:**
1.  **Project Title & Description**: Clear and concise.
2.  **Badges**: Status, version, license, etc.
3.  **Key Features**: Bullet points of main capabilities.
4.  **Installation**: Step-by-step setup instructions.
5.  **Usage**: Basic examples of how to use the project.
6.  **Configuration**: Environment variables, config files.
7.  **Contributing**: Link to `CONTRIBUTING.md`.
8.  **License**: License information.

### 2. API Documentation

Detailed reference for developers integrating with your API.

**Structure:**
-   **Endpoint**: HTTP method and path.
-   **Description**: What the endpoint does.
-   **Parameters**: Query, path, and body parameters (types, required/optional).
-   **Responses**: Status codes and example response bodies.
-   **Examples**: `curl` or code snippets.

### 3. Architecture Documentation

High-level overview of system components and interactions.

**Structure:**
-   **System Context**: How the system fits into the larger environment.
-   **Container Diagram**: High-level containers (web app, database, etc.).
-   **Component Diagram**: Internal components of a container.
-   **Data Flow**: How data moves through the system.
-   **Technology Stack**: Languages, frameworks, databases.

### 4. Technical Guides

In-depth explanations of specific features or workflows.

**Structure:**
-   **Introduction**: What will be covered.
-   **Prerequisites**: What is needed before starting.
-   **Steps**: Clear, numbered instructions.
-   **Troubleshooting**: Common issues and fixes.
-   **Further Reading**: Links to related docs.

## Best Practices

-   **Keep it up to date**: Outdated docs are worse than no docs.
-   **Use clear language**: Avoid jargon where possible; define terms.
-   **Include examples**: Code snippets and screenshots help understanding.
-   **Use Markdown**: Standard formatting (headers, lists, code blocks) improves readability.
-   **Link resources**: Connect related documents for easy navigation.
