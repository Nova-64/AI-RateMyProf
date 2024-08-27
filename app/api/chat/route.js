import {NextResponse} from 'next/server'
import {Pinecone} from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const systemPrompt = `You are an AI assistant specialized in helping students find professors based on various criteria. Your knowledge base consists of professor reviews and ratings. For each user query, you will:

1. Analyze the user's question to understand their requirements.
2. Use a RAG (Retrieval-Augmented Generation) system to search through the professor review database and find the most relevant matches.
3. Present the top 3 professors that best match the query, along with a brief explanation of why they were chosen.
4. Provide a summary of each professor's strengths, weaknesses, and any other relevant information from the reviews.
5. If the user's query is unclear or lacks specific criteria, ask follow-up questions to refine the search.

Your responses should be informative, concise, and tailored to the student's needs. Always maintain a neutral tone and base your recommendations solely on the available review data.

When presenting professor information, use the following format:

1. Professor Name (Subject)
   - Rating: X/5 stars
   - Key Strengths: [List 2-3 main strengths]
   - Areas for Improvement: [List 1-2 areas, if applicable]
   - Brief Summary: [2-3 sentences highlighting key points from reviews]

2. [Repeat format for second professor]

3. [Repeat format for third professor]

After presenting the top 3 professors, offer to provide more details or refine the search if the user needs additional information.

Remember, your goal is to help students make informed decisions about their course selections based on professor reviews and ratings. Always encourage users to consider multiple factors when choosing a professor, not just ratings alone.`

export async function POST(req){
    const data  = await req.json()
    const pc = new Pinecone({
       apiKey: process.env.PINECONE_API_KEY,    
    })
    const index = pc.index('reg').namespace('nova1')
    const openai = new OpenAI()

    const text = data[data.length -1].content
    const embedding  = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
    })
  const results = await index.query({
    topK:3,
    includeMetadata:  true,
    vector: embedding.data[0].embedding
  })

  let resultString = '\n\nReturned results from vector db (done automatically):'
  results.matches.forEach((match)=>{
     resultString += `\n
     Professor: ${match.id}
     Review:  ${match.metadata.stars}
     Subject:  ${match.metadata.subject}
     Stars   ${match.metadata.stars}
     \n\n
     `
  })

  const lastMessage = data[data.length - 1]
  const lastMessageContent = lastMessage.content + resultString
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1)
  const completion = await openai.chat.completions.create({
    messages: [
        { role: 'system', content: systemPrompt},
        ...lastDataWithoutLastMessage,
        { role: 'user', content: lastMessageContent}   
    ],
     model: 'gpt-4o-mini',
     stream: true,
  })
   const stream = new ReadableStream({
    async start(controller){
        const encoder = new TextEncoder()
        try{
            for await (const chunk of completion){
                const content = chunk.choices[0]?.delta?.content
                if (content){
                    const text= encoder.encode(content)
                    controller.enqueue(text)
            }
        }
    }  
     catch(err){
        controller.error(err)
     } finally {
        controller.close()
     }
     },
   })

     return new NextResponse(stream)
}