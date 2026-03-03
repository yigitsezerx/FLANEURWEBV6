export async function loadArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (!articleId) return;

    try {
        const response = await fetch('/articles.json');
        const articles = await response.json();
        const article = articles.find(a => a.id === articleId);

        if (!article) {
            document.getElementById('article-title').innerHTML = 'Makale Bulunamadı.';
            return;
        }

        // Populate Metadata
        document.title = `${article.title.replace(/<br>/g, ' ')} - Flaneur`;
        document.getElementById('article-issue').textContent = article.issue;
        document.getElementById('article-category').textContent = article.category;
        document.getElementById('article-title').innerHTML = article.title;

        const subtitleEl = document.getElementById('article-subtitle');
        if (subtitleEl && article.description) subtitleEl.innerHTML = article.description;

        document.getElementById('article-author').textContent = `Yazan: ${article.author}`;

        // Populate Hero Image with Fade-in
        const imgEl = document.getElementById('article-image');
        imgEl.src = article.image;
        imgEl.alt = article.imageAlt || 'Article Image';
        imgEl.onload = () => {
            imgEl.style.opacity = 1;
        };

        // Populate Content (Check localStorage for saved highlights first)
        const savedContent = localStorage.getItem(`flaneur_content_${articleId}`);
        const contentEl = document.getElementById('article-content');

        if (savedContent) {
            contentEl.innerHTML = savedContent;
        } else {
            contentEl.innerHTML = article.content;
        }

        // Calculate Reading Time
        const textContent = contentEl.innerText || contentEl.textContent;
        const wordCount = textContent.trim().split(/\s+/).length;
        const readingTimeMins = Math.ceil(wordCount / 200);
        document.getElementById('reading-time').textContent = `• Okuma süresi: ${readingTimeMins} dk`;

        // Generate Table of Contents
        generateToC(contentEl);

        // Populate Next Article
        if (article.nextArticleId) {
            const nextArticle = articles.find(a => a.id === article.nextArticleId);
            if (nextArticle) {
                document.getElementById('next-article-container').style.display = 'block';
                document.getElementById('next-article-link').href = `/article.html?id=${nextArticle.id}`;
                document.getElementById('next-article-title').innerHTML = nextArticle.title.replace(/<br>/g, ' ');
            }
        }

        setupFontResizer();
        setupHighlighter(articleId, contentEl);

    } catch (err) {
        console.error("Error loading article:", err);
    }
}

function generateToC(contentEl) {
    const headings = contentEl.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    const tocContainer = document.getElementById('toc-container');
    const tocList = document.getElementById('toc-list');

    // We only show ToC if there are headings
    tocContainer.style.display = 'block';

    headings.forEach((heading, index) => {
        // Enforce ID on headings
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }

        const li = document.createElement('li');
        li.style.marginBottom = '0.5rem';

        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        a.style.color = 'inherit';
        a.style.textDecoration = 'none';
        a.style.transition = 'color 0.3s';

        if (heading.tagName.toLowerCase() === 'h3') {
            li.style.paddingLeft = '1rem';
            li.style.fontSize = '0.85em';
        }

        a.addEventListener('click', (e) => {
            e.preventDefault();
            heading.scrollIntoView({ behavior: 'smooth' });
        });

        li.appendChild(a);
        tocList.appendChild(li);

        // Scroll listener for active state mapping
        window.addEventListener('scroll', () => {
            const rect = heading.getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= window.innerHeight / 3) {
                // Highlight logic
                tocList.querySelectorAll('a').forEach(link => {
                    link.style.color = 'inherit';
                    link.style.fontWeight = 'normal';
                });
                a.style.color = '#ff0000'; // Brutalist Red
                a.style.fontWeight = 'bold';
            }
        }, { passive: true });
    });
}

function setupFontResizer() {
    let currentScale = 1;
    const contentEl = document.getElementById('article-content');

    const btnInc = document.getElementById('btn-font-inc');
    const btnDec = document.getElementById('btn-font-dec');
    const btnReset = document.getElementById('btn-font-reset');

    if (btnInc) {
        btnInc.addEventListener('click', () => {
            if (currentScale < 1.5) currentScale += 0.1;
            contentEl.style.setProperty('--text-scale', currentScale);
        });
    }

    if (btnDec) {
        btnDec.addEventListener('click', () => {
            if (currentScale > 0.8) currentScale -= 0.1;
            contentEl.style.setProperty('--text-scale', currentScale);
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            currentScale = 1;
            contentEl.style.setProperty('--text-scale', currentScale);
        });
    }
}

function setupHighlighter(articleId, contentEl) {
    const popup = document.getElementById('highlighter-popup');
    if (!popup) return;

    popup.style.display = 'none';

    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        let isInsideContent = false;
        let node = selection.anchorNode;
        while (node) {
            if (node === contentEl) {
                isInsideContent = true;
                break;
            }
            node = node.parentNode;
        }

        if (text.length > 5 && isInsideContent) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            // Always centered and smooth
            popup.style.display = 'flex';
            popup.classList.add('hl-smooth');
            popup.style.top = `${rect.top + window.scrollY - popup.offsetHeight - 5}px`;
            popup.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;
        } else {
            popup.style.display = 'none';
        }
    });

    const applyHighlight = (className) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        // Always Multi-para & Animated
        const treeWalker = document.createTreeWalker(
            range.commonAncestorContainer.nodeType === Node.TEXT_NODE ? range.commonAncestorContainer.parentNode : range.commonAncestorContainer,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (n) {
                    return range.intersectsNode(n) && n.nodeValue.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            },
            false
        );

        const nodes = [];
        while (treeWalker.nextNode()) nodes.push(treeWalker.currentNode);

        if (nodes.length > 0) {
            const highlightGroupId = Date.now();
            for (let i = 0; i < nodes.length; i++) {
                let textNode = nodes[i];
                let start = (textNode === range.startContainer) ? range.startOffset : 0;
                let end = (textNode === range.endContainer) ? range.endOffset : textNode.length;

                if (start >= end) continue;

                const text = textNode.nodeValue;
                const before = text.substring(0, start);
                const match = text.substring(start, end);
                const after = text.substring(end);

                const fragment = document.createDocumentFragment();
                if (before) fragment.appendChild(document.createTextNode(before));

                const span = document.createElement('span');
                span.className = className;
                span.dataset.timestamp = highlightGroupId;
                span.classList.add('hl-animated');
                span.textContent = match;
                fragment.appendChild(span);

                if (after) fragment.appendChild(document.createTextNode(after));

                textNode.parentNode.replaceChild(fragment, textNode);

                ((s) => setTimeout(() => s.classList.add('show-anim'), 10))(span);
            }
        }

        selection.removeAllRanges();
        popup.style.display = 'none';

        setTimeout(() => localStorage.setItem(`flaneur_content_${articleId}`, contentEl.innerHTML), 50);
    };

    document.getElementById('hl-yellow').addEventListener('click', () => applyHighlight('highlight-yellow'));
    document.getElementById('hl-red').addEventListener('click', () => applyHighlight('highlight-red'));

    document.getElementById('hl-clear').addEventListener('click', () => {
        localStorage.removeItem(`flaneur_content_${articleId}`);
        window.location.reload();
    });

    // Specific Erase and Annotation
    let currentNoteSpan = null;
    contentEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('highlight-yellow') || e.target.classList.contains('highlight-red')) {
            e.stopPropagation();
            currentNoteSpan = e.target;

            const pts = e.target.dataset.timestamp;
            let noteText = e.target.dataset.note || "";
            if (!noteText && pts) {
                const matching = contentEl.querySelector(`span[data-timestamp="${pts}"]`);
                if (matching) noteText = matching.dataset.note || "";
            }

            document.getElementById('annotation-text').value = noteText;
            document.getElementById('annotation-modal').style.display = 'block';
            document.getElementById('annotation-overlay').style.display = 'block';
        }
    });

    const closeModal = () => {
        const modal = document.getElementById('annotation-modal');
        const overlay = document.getElementById('annotation-overlay');
        if (modal) modal.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
        currentNoteSpan = null;
    };

    document.getElementById('annotation-save')?.addEventListener('click', () => {
        if (currentNoteSpan) {
            const noteText = document.getElementById('annotation-text').value;
            const pts = currentNoteSpan.dataset.timestamp;

            if (pts) {
                contentEl.querySelectorAll(`span[data-timestamp="${pts}"]`).forEach(s => {
                    s.dataset.note = noteText;
                    s.title = noteText;
                });
            } else {
                currentNoteSpan.dataset.note = noteText;
                currentNoteSpan.title = noteText;
            }
            localStorage.setItem(`flaneur_content_${articleId}`, contentEl.innerHTML);
        }
        closeModal();
    });

    document.getElementById('annotation-delete')?.addEventListener('click', () => {
        if (currentNoteSpan) {
            const pts = currentNoteSpan.dataset.timestamp;
            const spansToUnwrap = pts ? Array.from(contentEl.querySelectorAll(`span[data-timestamp="${pts}"]`)) : [currentNoteSpan];

            spansToUnwrap.forEach(span => {
                const parent = span.parentNode;
                while (span.firstChild) {
                    parent.insertBefore(span.firstChild, span);
                }
                parent.removeChild(span);
                parent.normalize();
            });

            localStorage.setItem(`flaneur_content_${articleId}`, contentEl.innerHTML);
        }
        closeModal();
    });

    document.getElementById('annotation-cancel')?.addEventListener('click', closeModal);
    document.getElementById('annotation-overlay')?.addEventListener('click', closeModal);
}

export async function loadArticleLists() {
    const indexList = document.getElementById('index-article-list');
    const archiveList = document.getElementById('archive-article-list');

    if (!indexList && !archiveList) return;

    try {
        const response = await fetch('/articles.json');
        const articles = await response.json();

        if (indexList) {
            indexList.innerHTML = articles.map(article => `
                <article class="article-item">
                    <a href="/article.html?id=${article.id}" aria-label="Yazıyı Oku: ${article.title.replace(/<br>/g, ' ')}">
                        <div class="article-image">
                            <img src="${article.image}" alt="${article.imageAlt}" loading="lazy">
                        </div>
                        <div class="article-meta">
                            <h2>${article.title}</h2>
                            <p>${article.description || ''}</p>
                            <span>Yazıyı Oku</span>
                        </div>
                    </a>
                </article>
            `).join('');
        }

        if (archiveList) {
            archiveList.innerHTML = articles.map(article => `
                <article class="archive-item">
                    <a href="/article.html?id=${article.id}">
                        <h2 class="archive-item-title">${article.title.replace(/<br>/g, ' ')}</h2>
                        <div class="archive-item-meta">
                            <span>${article.issue}</span>
                            <span>Yazan: ${article.author}</span>
                        </div>
                    </a>
                </article>
            `).join('');
        }
    } catch (err) {
        console.error("Error loading article lists:", err);
    }
}
