import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const HELP_DIRECTORY = path.join(process.cwd(), "content", "ajuda");

export type HelpArticle = {
  slug: string;
  slugParts: string[];
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  order: number;
  featured: boolean;
  keywords: string[];
  updatedAt?: string;
  content: string;
  searchText: string;
};

export type HelpCategory = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
};

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    slug: "clientes",
    title: "Check-up e relatórios",
    description:
      "Orientações para fazer o Check-up Emocional, acessar e recuperar relatórios.",
    icon: "◉",
    order: 1,
  },
  {
    slug: "acesso",
    title: "Acesso ao painel",
    description:
      "Login, senha e acesso às áreas de afiliados e distribuidores.",
    icon: "↗",
    order: 2,
  },
  {
    slug: "parceiros",
    title: "Afiliados e distribuidores",
    description:
      "Cadastro, links, divulgação, materiais e funcionamento da parceria.",
    icon: "◇",
    order: 3,
  },
  {
    slug: "comissoes",
    title: "Comissões e recebimentos",
    description:
      "Entenda como os valores são registrados e recebidos pelo parceiro.",
    icon: "R$",
    order: 4,
  },
  {
    slug: "conta-asaas",
    title: "Conta Asaas",
    description:
      "Validação da conta, reprovação cadastral e dados para recebimento.",
    icon: "A",
    order: 5,
  },
  {
    slug: "reembolsos",
    title: "Reembolsos",
    description:
      "Solicitação, análise, acompanhamento e prazo operacional.",
    icon: "↻",
    order: 6,
  },
];

function walkMarkdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkMarkdownFiles(fullPath);
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      return [fullPath];
    }

    return [];
  });
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function markdownToSearchText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function filePathToSlugParts(filePath: string): string[] {
  const relativePath = path.relative(HELP_DIRECTORY, filePath);
  const withoutExtension = relativePath.replace(/\.md$/, "");

  return withoutExtension.split(path.sep);
}

function readArticle(filePath: string): HelpArticle {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const slugParts = filePathToSlugParts(filePath);
  const categorySlug = slugParts[0] ?? "outros";

  const title =
    typeof data.title === "string" ? data.title : "Artigo sem título";

  const description =
    typeof data.description === "string" ? data.description : "";

  const category =
    typeof data.category === "string"
      ? data.category
      : HELP_CATEGORIES.find((item) => item.slug === categorySlug)?.title ??
        "Outros";

  const keywords = normalizeStringArray(data.keywords);

  return {
    slug: slugParts.join("/"),
    slugParts,
    title,
    description,
    category,
    categorySlug,
    order: typeof data.order === "number" ? data.order : 999,
    featured: data.featured === true,
    keywords,
    updatedAt:
      typeof data.updatedAt === "string" ? data.updatedAt : undefined,
    content,
    searchText: [
      title,
      description,
      category,
      keywords.join(" "),
      markdownToSearchText(content),
    ]
      .join(" ")
      .toLowerCase(),
  };
}

export function getAllHelpArticles(): HelpArticle[] {
  return walkMarkdownFiles(HELP_DIRECTORY)
    .map(readArticle)
    .sort((first, second) => {
      const firstCategory =
        HELP_CATEGORIES.find((item) => item.slug === first.categorySlug)
          ?.order ?? 999;

      const secondCategory =
        HELP_CATEGORIES.find((item) => item.slug === second.categorySlug)
          ?.order ?? 999;

      if (firstCategory !== secondCategory) {
        return firstCategory - secondCategory;
      }

      if (first.order !== second.order) {
        return first.order - second.order;
      }

      return first.title.localeCompare(second.title, "pt-BR");
    });
}

export function getHelpArticle(
  slugParts: string[],
): HelpArticle | undefined {
  const safeParts = slugParts.filter(
    (part) => part && part !== "." && part !== "..",
  );

  if (safeParts.length !== slugParts.length) {
    return undefined;
  }

  const filePath = path.join(
    HELP_DIRECTORY,
    ...safeParts.slice(0, -1),
    `${safeParts.at(-1)}.md`,
  );

  if (!fs.existsSync(filePath)) {
    return undefined;
  }

  return readArticle(filePath);
}

export function getArticlesByCategory(categorySlug: string): HelpArticle[] {
  return getAllHelpArticles().filter(
    (article) => article.categorySlug === categorySlug,
  );
}