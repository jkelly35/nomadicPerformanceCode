// src/app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getAllPostsMeta, getPostBySlug } from "@/lib/posts";
import NavBar from "../../../components/NavBar";
import Footer from "../../../components/Footer";
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// Pre-generate static paths
export async function generateStaticParams() {
  const posts = await getAllPostsMeta();
  return posts.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { meta } = await getPostBySlug(slug).catch(() => ({ meta: null }));
  if (!meta) return {};
  return {
    title: `${meta.title} — Nomadic Performance`,
    description: meta.excerpt,
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { meta, content } = await getPostBySlug(slug).catch(() => ({ meta: null, content: "" }));
  if (!meta) return notFound();

  // Process markdown to HTML on the server
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeStringify)
    .process(content);

  const htmlContent = processedContent.toString();

  return (
    <main>
      <NavBar />
      <section style={{ padding: '2rem 1rem', background: '#f9f9f9', minHeight: '20vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 6vw, 3rem)',
            fontWeight: 900,
            color: '#1a3a2a',
            marginBottom: '1rem'
          }}>
            {meta.title}
          </h1>
          <p style={{
            fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
            color: '#666'
          }}>
            {new Date(meta.date).toLocaleDateString()}
          </p>
        </div>
      </section>
      <section style={{
        padding: '2rem 1rem',
        background: '#fff'
      }}>
        <div className="blog-content" style={{
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.8',
          fontSize: 'clamp(1rem, 2vw, 1.1rem)',
          color: '#333',
          fontFamily: 'Georgia, serif'
        }}>
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
