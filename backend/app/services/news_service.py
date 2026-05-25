"""
News & Blog service — CRUD operations for news_posts.
"""
import re
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.models import NewsPost
from app.schemas.schemas import NewsPostCreate, NewsPostUpdate

# Upload directory for news cover images
BASE_DIR = Path(__file__).resolve().parent.parent.parent
NEWS_IMAGE_DIR = BASE_DIR / "uploads" / "news"
NEWS_IMAGE_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB


def _make_slug(title: str) -> str:
    """Convert title to a URL-friendly slug."""
    slug = title.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    slug = slug.strip("-")
    return slug[:280]


def _unique_slug(db: Session, base: str) -> str:
    slug = base
    counter = 1
    while db.query(NewsPost).filter(NewsPost.slug == slug).first():
        slug = f"{base}-{counter}"
        counter += 1
    return slug


async def save_news_image(image: UploadFile) -> str:
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Image must be JPEG, PNG, or WebP.",
        )
    contents = await image.read()
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Image exceeds 5 MB limit.",
        )
    ext = image.filename.rsplit(".", 1)[-1].lower() if "." in image.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    with open(NEWS_IMAGE_DIR / filename, "wb") as f:
        f.write(contents)
    return f"/uploads/news/{filename}"


def create_post(db: Session, data: NewsPostCreate, image_url: Optional[str] = None) -> NewsPost:
    slug = _unique_slug(db, _make_slug(data.title))
    post = NewsPost(
        title=data.title,
        slug=slug,
        category=data.category,
        content=data.content,
        excerpt=data.excerpt or data.content[:200],
        image_url=image_url,
        author=data.author,
        is_published=data.is_published,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def get_all_posts(db: Session, category: Optional[str] = None, published_only: bool = True) -> List[NewsPost]:
    q = db.query(NewsPost)
    if published_only:
        q = q.filter(NewsPost.is_published == True)
    if category:
        q = q.filter(NewsPost.category == category)
    return q.order_by(NewsPost.published_at.desc()).all()


def get_post_by_id(db: Session, post_id: int) -> NewsPost:
    post = db.query(NewsPost).filter(NewsPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    return post


def get_post_by_slug(db: Session, slug: str) -> NewsPost:
    post = db.query(NewsPost).filter(NewsPost.slug == slug).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    return post


def update_post(
    db: Session,
    post_id: int,
    data: NewsPostUpdate,
    image_url: Optional[str] = None,
) -> NewsPost:
    post = get_post_by_id(db, post_id)
    if data.title is not None:
        post.title = data.title
        post.slug = _unique_slug(db, _make_slug(data.title))
    if data.category is not None:
        post.category = data.category
    if data.content is not None:
        post.content = data.content
    if data.excerpt is not None:
        post.excerpt = data.excerpt
    if data.author is not None:
        post.author = data.author
    if data.is_published is not None:
        post.is_published = data.is_published
    if image_url is not None:
        post.image_url = image_url
    db.commit()
    db.refresh(post)
    return post


def delete_post(db: Session, post_id: int) -> None:
    post = get_post_by_id(db, post_id)
    db.delete(post)
    db.commit()
