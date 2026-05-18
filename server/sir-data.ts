import sirProgram from '../data/telangana/sir-program.json'
import ghmc from '../data/telangana/ghmc-structure.json'
import fieldMapping from '../data/telangana/sir-field-mapping.json'
import links from '../data/telangana/official-links.json'
import assemblyFile from '../data/telangana/assembly-constituencies.json'

export type AssemblyConstituency = (typeof assemblyFile.constituencies)[number]

export function getSirContext() {
  return {
    program: sirProgram,
    ghmc,
    fieldMapping,
    links,
    constituencies: assemblyFile,
  }
}

export function getAssemblyConstituencies(): AssemblyConstituency[] {
  return assemblyFile.constituencies
}
