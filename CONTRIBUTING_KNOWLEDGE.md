# Contributing to Prior Knowledge Augmentation

Fuji-Web's Prior Knowledge Augmentation system is designed to enhance the tool's web navigation and task execution capabilities by leveraging a shared knowledge base. Contributions to this system help make Fuji-Web smarter and more capable.

## What Kind of Knowledge Are We Looking For?

We seek knowledge that:
- Enhances the understanding of specific web pages or actions, making task execution more reliable.
- Includes insights into website layouts, common patterns, and user interfaces that are not immediately obvious.
- Provides rules or annotations that help the AI better interpret the purpose of elements on a page.

For example, if a website has two buttons with the same name but different functionalities, it's crucial to describe in notes how to distinguish between them.

## How to Add and Test New Knowledge

We offer two convenient ways to add and test new knowledge in real-time:
- Via Form: Within the Fuji-Web UI settings, navigate to the "Custom Knowledge Base" and select "Add Host Knowledge with Form" to input new knowledge using a user-friendly form.
- Via JSON: If you prefer to work directly with JSON, choose "Add Host Knowledge with JSON" to enter your custom knowledge.

You can test the new knowledge by running several tasks on the relevant web pages to ensure Fuji-Web behaves as expected.

Once you've tested various knowledge inputs and are satisfied with the new knowledge's performance, you can then copy that knowledge into the db.json file.

1. Locate the `db.json` file in the `src/helpers/knowledge` directory of the Fuji-Web repository.
2. Add your knowledge in the JSON format, following the existing structure. `annotationRules` is optional.
   ```json
   {
     "example.com": {
       "rules": [
         {
           "regexes": ["regular expression to match pathname (not host name)"],
           "knowledge": {
             "notes": ["Your insights or notes about this page or action"],
             "annotationRules": [
               {
                 "selector": "CSS selector",
                 "allowInvisible": true,
                 "allowCovered": true,
                 "allowAriaHidden": true
               }
             ]
           }
         }
       ]
     }
   }
   ```
3. Please ensure your contributions are clear and concise, with `regexes` and `selector` accurately defined.

## Submitting Your Contribution

Please check out the [Contribution Guide](CONTRIBUTING.md). Share your testing process and results in your pull request to help reviewers understand the impact of your contribution. Specifically, describe how the new knowledge help Fuji-Web achieve something it previously cannot perform correctly.
