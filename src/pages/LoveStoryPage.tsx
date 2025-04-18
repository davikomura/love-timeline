import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  PhotoIcon,
  SparklesIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, useParams } from "react-router-dom";
import { RelationshipTimer } from "../components/RelationshipTimer";
import { getWebsites, getImagesByWebsiteId } from "../api/websiteService";

function slugify(text: string): string {
  return text
    .trimStart() // remove espaços do início
    .toLowerCase()
    .normalize("NFD") // separa os acentos dos caracteres
    .replace(/[\u0300-\u036f]/g, "") // remove os acentos
    .replace(/&/g, "and") // substitui o "&" por "and"
    .replace(/[^a-z0-9]+/g, "-") // substitui caracteres inválidos por hífens
    .replace(/^-+|-+$/g, ""); // remove hífens do início e do fim
}

interface LoveStoryData {
  id: number;
  title: string;
  message: string;
  relationshipDate: string;
  selectedSong: any;
  photos?: string[];
}

const fetchLoveStoryData = async (): Promise<LoveStoryData[]> => {
  try {
    const websites = await getWebsites();
    return websites.map((site: any) => ({
      id: site.id,
      title: site.title,
      message: site.text,
      relationshipDate: site.dataCouple,
      selectedSong: site.music_url || null,
    }));
  } catch (error) {
    console.error("Erro ao buscar histórias de amor:", error);
    return [];
  }
};

const fetchPhotoData = async (websiteId: number): Promise<string[]> => {
  try {
    const images = await getImagesByWebsiteId(websiteId);
    console.log("Imagens:", images);
    return images
      .map((image: any) => image.imgUrl?.trim())
      .filter((url: string | undefined): url is string => !!url); // remove undefined/null
  } catch (error) {
    console.error("Erro ao buscar imagens:", error);
    return [];
  }
};

export const LoveStoryPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<LoveStoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // const [selectedSong] = useState<{ id: string } | null>(null);
  // const { slug } = useParams<{ slug: string }>();
  const { id, slug } = useParams<{ id: string; slug: string }>();

  useEffect(() => {
    if (!id) return;

    fetchLoveStoryData().then((response) => {
      const matched = response.find((item) => String(item.id) === id);
      setData(matched || null);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (data?.title && id && slug) {
      const generatedSlug = slugify(data.title);
      if (slug !== generatedSlug) {
        navigate(`/${id}/${generatedSlug}`, { replace: true });
      }
    }
  }, [data, slug, id, navigate]);

  useEffect(() => {
    if (data?.id) {
      fetchPhotoData(data.id).then((photos) => {
        setData((prevData) =>
          prevData ? { ...prevData, photos: photos } : prevData
        );
        console.log("Id:", data.id);
      });
    }
  }, [data?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 to-pink-950 p-8 flex items-center justify-center">
        <p className="text-white text-xl">{t("form.loading")}</p>
      </div>
    );
  }

  if (!data) return <div>História não encontrada.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 to-pink-950 p-8 text-white flex flex-col">
      {/* Cabeçalho */}
      <header className="text-center mb-8">
        <h1 className="truncate text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
          {data.title || t("form.default_title")}
        </h1>
        <SparklesIcon className="mx-auto h-8 w-8 text-pink-400/50 mt-2 animate-pulse" />
      </header>

      {/* Seção do Timer */}
      <section className="mb-12 text-center">
        {data.relationshipDate ? (
          <RelationshipTimer startDate={data.relationshipDate} />
        ) : (
          <div className="text-purple-300/50 flex items-center justify-center space-x-2">
            <HeartIcon className="w-6 h-6" />
            <span>{t("form.select_date")}</span>
          </div>
        )}
      </section>

      {/* Seção da Foto de Capa */}
      <section className="mb-12 flex justify-center px-4">
        <div
          className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-600/20 transform hover:scale-105 transition-all duration-500"
        >
          {data.photos?.[0] ? (
            <img
              src={data.photos[0]}
              alt="Capa"
              className="w-3xl h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-pink-400/30">
              <PhotoIcon className="w-20 h-20 animate-pulse" />
            </div>
          )}
        </div>
      </section>

      {/* Seção da Mensagem */}
      <section className="mb-12 mx-auto w-full max-w-3xl px-4">
        <div className="relative bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-xl p-6 border border-purple-500/30 min-h-[150px]">
          {data.message ? (
            <p className="text-purple-100 leading-relaxed whitespace-pre-wrap break-words font-serif text-justify">
              {data.message}
            </p>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <span className="text-purple-400/50 block">✍️</span>
                <p className="text-purple-400/50 italic text-sm">
                  {t("form.default_message")}
                </p>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 right-2 text-purple-400/30">
            <HeartIcon className="w-8 h-8" />
          </div>
        </div>
      </section>

      {/* Seção da Galeria de Fotos */}
      {data.photos && data.photos.length > 1 && (
        <section className="grid grid-cols-3 gap-4 mx-auto max-w-4xl">
          {data.photos.slice(1).map((url, index) => (
            <div
              key={index}
              className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg aspect-[3/4] rounded-lg overflow-hidden transform transition-all hover:scale-105 hover:z-10 hover:shadow-xl group"
            >
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover transform group-hover:rotate-1 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-transparent to-transparent" />
            </div>
          ))}
        </section>
      )}

      {/* Seção do Player de Música do Spotify */}
      {data.selectedSong && (
        <div className="w-full max-w-3xl mx-auto mt-6 border border-purple-500/20 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-purple-800/40 to-pink-800/30 backdrop-blur-md">
          <iframe
            src={`${data.selectedSong}?utm_source=generator&autoplay=1`}
            width="100%"
            height="80"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-b-xl"
          ></iframe>
        </div>
      )}
    </div>
  );
};
