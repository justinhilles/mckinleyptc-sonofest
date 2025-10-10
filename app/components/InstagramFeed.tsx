"use client";

import Image from 'next/image';
import Script from 'next/script';
import { useEffect } from 'react';

import { InstagramIcon } from '@/app/components/icons';
import type { InstagramPost } from '@/app/lib/types';

declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process?: () => void;
      };
    };
  }
}

type InstagramFeedProps = {
  posts: InstagramPost[];
  profileUrl?: string;
  handle?: string | null;
};

export default function InstagramFeed({ posts, profileUrl, handle }: InstagramFeedProps) {
  const hasProfile = Boolean(profileUrl);
  const hasFallbackPosts = posts.length > 0;

  const normalizedHandle = handle ? `@${handle.replace(/^@/, '')}` : null;

  useEffect(() => {
    if (!profileUrl) {
      return;
    }

    if (typeof window !== 'undefined' && window.instgrm?.Embeds?.process) {
      window.instgrm.Embeds.process();
    }
  }, [profileUrl]);

  if (!hasProfile && !hasFallbackPosts) {
    return null;
  }

  return (
    <section className="instagram" aria-labelledby="instagram-feed-title">
      <div className="instagram__header">
        <h2 id="instagram-feed-title" className="instagram__title">
          Latest From Instagram
        </h2>
        {profileUrl ? (
          <a
            className="instagram__profile"
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={normalizedHandle ? `Open ${normalizedHandle} on Instagram` : 'Open Instagram profile'}
          >
            <span className="instagram__profile-icon" aria-hidden="true">
              <InstagramIcon />
            </span>
            <span>{normalizedHandle ?? 'Follow Us'}</span>
          </a>
        ) : null}
      </div>
      {hasProfile ? (
        <>
          <div className="instagram__embed">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={`${profileUrl}?utm_source=ig_embed&utm_campaign=loading`}
              data-instgrm-version="14"
            >
              <a href={`${profileUrl}?utm_source=ig_embed&utm_campaign=loading`} target="_blank" rel="noopener noreferrer">
                View this profile on Instagram
              </a>
            </blockquote>
          </div>
          <Script
            src="https://www.instagram.com/embed.js"
            strategy="lazyOnload"
            onLoad={() => {
              if (typeof window !== 'undefined' && window.instgrm?.Embeds?.process) {
                window.instgrm.Embeds.process();
              }
            }}
          />
        </>
      ) : (
        <div className="instagram__grid" role="list">
          {posts.map((post) => (
            <a
              key={post.id}
              className="instagram__item"
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              role="listitem"
              aria-label={`View Instagram post: ${post.alt}`}
            >
              <div className="instagram__media">
                <Image
                  src={post.image}
                  alt={post.alt}
                  fill
                  sizes="(min-width: 1200px) 220px, (min-width: 768px) 30vw, 80vw"
                />
              </div>
              <span className="instagram__item-overlay" aria-hidden="true">
                <InstagramIcon />
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
