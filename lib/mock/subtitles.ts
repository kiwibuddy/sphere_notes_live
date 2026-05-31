import type { SubtitleLine } from "@/types/session";

export const mockSubtitles: SubtitleLine[] = [
  {
    id: "s1",
    textEn:
      "A biblical worldview begins with the conviction that God is the creator and sustainer of all reality.",
    translations: {
      nb: "Et bibelsk verdensbilde begynner med overbevisningen om at Gud er skaperen og oppholderen av all virkelighet.",
      sv: "En biblisk världsbild börjar med övertygelsen att Gud är skaparen och upprätthållaren av all verklighet.",
      de: "Eine biblische Weltanschauung beginnt mit der Überzeugung, dass Gott der Schöpfer und Erhalter der ganzen Wirklichkeit ist.",
      fr: "Une vision biblique du monde commence par la conviction que Dieu est le créateur et le soutien de toute la réalité.",
      es: "Una cosmovisión bíblica comienza con la convicción de que Dios es el creador y sustentador de toda la realidad.",
    },
  },
  {
    id: "s2",
    textEn:
      "Scripture does not merely inform our beliefs — it reshapes how we see every domain of life.",
    translations: {
      nb: "Skriften informerer ikke bare våre overbevisninger — den omformer hvordan vi ser hvert livsområde.",
      sv: "Skriften informerar inte bara våra övertygelser — den omformar hur vi ser varje livsområde.",
      de: "Die Schrift informiert nicht nur unsere Überzeugungen — sie formt neu, wie wir jeden Lebensbereich sehen.",
      fr: "Les Écritures n'informent pas seulement nos croyances — elles transforment notre vision de chaque domaine de la vie.",
      es: "La Escritura no solo informa nuestras creencias — transforma cómo vemos cada ámbito de la vida.",
    },
  },
  {
    id: "s3",
    textEn:
      "When Paul writes in Colossians that all things hold together in Christ, he is making a claim about the whole cosmos.",
    translations: {
      nb: "Når Paulus skriver i Kolosserne at alle ting holdes sammen i Kristus, hevder han noe om hele kosmos.",
      sv: "När Paulus skriver i Kolosserbrevet att allt hålls samman i Kristus, gör han ett påstående om hela kosmos.",
      de: "Wenn Paulus in den Kolossern schreibt, dass alle Dinge in Christus zusammengehalten werden, macht er eine Aussage über den ganzen Kosmos.",
      fr: "Quand Paul écrit aux Colossiens que toutes choses subsistent en Christ, il affirme quelque chose sur le cosmos entier.",
      es: "Cuando Pablo escribe en Colosenses que todas las cosas subsisten en Cristo, está haciendo una afirmación sobre todo el cosmos.",
    },
  },
  {
    id: "s4",
    textEn:
      "The question for YWAM is not whether we have a worldview, but whether our worldview is consciously biblical.",
    translations: {
      nb: "Spørsmålet for YWAM er ikke om vi har et verdensbilde, men om vårt verdensbilde bevisst er bibelsk.",
      sv: "Frågan för YWAM är inte om vi har en världsbild, utan om vår världsbild medvetet är biblisk.",
      de: "Die Frage für YWAM ist nicht, ob wir eine Weltanschauung haben, sondern ob unsere Weltanschauung bewusst biblisch ist.",
      fr: "La question pour JEM n'est pas de savoir si nous avons une vision du monde, mais si notre vision du monde est consciemment biblique.",
      es: "La pregunta para JUCUM no es si tenemos una cosmovisión, sino si nuestra cosmovisión es conscientemente bíblica.",
    },
    isCurrent: true,
  },
];

export function getSubtitlesForDay(day: number): SubtitleLine[] {
  if (day === 1) {
    return mockSubtitles.slice(0, 2).map((s, i) => ({
      ...s,
      isCurrent: i === 1,
    }));
  }
  if (day === 2) {
    return mockSubtitles.slice(1, 3).map((s, i) => ({
      ...s,
      isCurrent: i === 1,
    }));
  }
  return mockSubtitles;
}
