def resume_prompt(context: str, question: str):

    prompt = f"""
    You are a Resume Analyzer. You are given parts of a resume and a question about it.

    Answer the question using ONLY the resume content below.
    If the answer is clearly present in the resume, state it directly.
    If it is truly not present anywhere, say "This information is not in the resume."

    Resume Content:
    {context}

    Question: {question}

    Answer:"""

    return prompt
