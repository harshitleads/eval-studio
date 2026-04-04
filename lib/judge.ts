import type { RubricCriterion, JudgeConfig, ProviderKeys, CouncilResult, ConfigOutput, Provider } from '@/types';
import { callModel } from '@/lib/callModel';
import { computeWeightedScore } from '@/lib/scorer';

type JudgeScores = Record<string, Record<string, number>>;

function buildJudgePrompt(
  input: string,
  outputs: { configId: string; configLabel: string; output: string }[],
  rubric: RubricCriterion[]
): string {
  const criteriaList = rubric
    .map(r => `- ${r.id}: ${r.name} - ${r.description}`)
    .join('\n');

  const outputBlocks = outputs
    .map(o => `--- ${o.configLabel} ---\n${o.output}`)
    .join('\n\n');

  const exampleScores = outputs
    .map(o => `    "${o.configId}": { ${rubric.map(r => `"${r.id}": 85`).join(', ')} }`)
    .join(',\n');

  return `You are an expert AI output evaluator. Score each response below independently.

Input prompt: ${input}

${outputBlocks}

Score EACH response independently on these criteria (0-100 per criterion, where 100 = perfect):
${criteriaList}

Return ONLY valid JSON, no preamble, no markdown:
{
  "scores": {
${exampleScores}
  }
}`;
}

async function callJudge(
  prompt: string,
  judge: JudgeConfig,
  providerKeys: ProviderKeys
): Promise<JudgeScores> {
  const result = await callModel(
    prompt,
    'You are an impartial AI evaluator. Return only valid JSON.',
    judge.provider,
    judge.model,
    providerKeys
  );
  const clean = result.text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean) as { scores: JudgeScores };
  return parsed.scores;
}

export async function judgeCouncil(
  input: string,
  outputs: { configId: string; configLabel: string; output: string }[],
  rubric: RubricCriterion[],
  judge1: JudgeConfig,
  judge2: JudgeConfig | null,
  providerKeys: ProviderKeys,
  configProviders: Provider[]
): Promise<CouncilResult> {
  const prompt = buildJudgePrompt(input, outputs, rubric);

  const j1Scores = await callJudge(prompt, judge1, providerKeys);

  let j2Scores: JudgeScores | null = null;
  if (judge2) {
    j2Scores = await callJudge(prompt, judge2, providerKeys);
  }

  // Compute per-config scores
  let outlierDetected = false;
  const configOutputs: ConfigOutput[] = outputs.map(o => {
    const j1CriterionScores = j1Scores[o.configId] ?? {};
    const j1Weighted = computeWeightedScore(j1CriterionScores, rubric);

    let j2Weighted: number | undefined;
    let councilScore: number;

    if (j2Scores && j2Scores[o.configId]) {
      const j2CriterionScores = j2Scores[o.configId];
      j2Weighted = computeWeightedScore(j2CriterionScores, rubric);
      councilScore = Math.round((j1Weighted + j2Weighted) / 2);

      if (Math.abs(j1Weighted - j2Weighted) > 15) {
        outlierDetected = true;
      }
    } else {
      councilScore = j1Weighted;
    }

    return {
      configId: o.configId,
      configLabel: o.configLabel,
      output: o.output,
      councilScore,
      judge1Score: j1Weighted,
      judge2Score: j2Weighted,
      rank: 0,
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
    };
  });

  // Rank by council score descending
  const sorted = [...configOutputs].sort((a, b) => b.councilScore - a.councilScore);
  sorted.forEach((co, i) => {
    const original = configOutputs.find(c => c.configId === co.configId);
    if (original) original.rank = i + 1;
  });

  const rankedConfigIds = sorted.map(c => c.configId);

  // Bias warning: judge providers overlap with config providers
  const judgeProviders: Provider[] = [judge1.provider];
  if (judge2) judgeProviders.push(judge2.provider);
  const biasWarning = judgeProviders.some(j => configProviders.includes(j));

  return {
    configOutputs,
    rankedConfigIds,
    outlierDetected,
    biasWarning,
  };
}
