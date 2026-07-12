import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SubscribeForm from "@/components/SubscribeForm";
import { getAllPosts, getPost, formatLogNo } from "@/lib/posts";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) return {};

  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main>
      <article className="post">
        <div className="wrap">
          <p className="post-no">{formatLogNo(post.no)}</p>
          <h1>{post.title}</h1>
          <p className="post-date">{post.date}</p>
          <div
            className="post-body"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </div>
      </article>

      <section className="section">
        <div className="wrap">
          <SubscribeForm />
        </div>
      </section>
    </main>
  );
}
