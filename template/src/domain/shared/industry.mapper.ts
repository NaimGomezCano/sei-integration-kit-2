import { DomainError } from '@/core/errors/domain.error'

export interface Industry {
  code: number
  name: string
}

export class IndustryMapper {
  private industries: Industry[] = [
    { code: 1, name: 'Centros de formación' },
    { code: 2, name: 'Cirugía plástica' },
    { code: 3, name: 'Clinica dental' },
    { code: 4, name: 'Dermatología' },
    { code: 5, name: 'Distribuidores de productos médicos' },
    { code: 6, name: 'Distribuidor Internacional' },
    { code: 7, name: 'Farmacia y parafarmacia' },
    { code: 8, name: 'Medicina estética' },
    { code: 9, name: 'Spa y bienestar' },
    { code: 10, name: 'Otros' },
  ]

  public getCodeByName(name: string | null | undefined): number | undefined {
    if (name == null) {
      return undefined
    }
    const industry = this.industries.find((ind) => ind.name.toLowerCase() === name.toLowerCase())
    if (!industry) {
      throw new DomainError(`Industria con nombre "${name}" no encontrada.`)
    }
    return industry.code
  }

  public getNameByCode(code: number | null | undefined): string | undefined {
    if (code == null) {
      return undefined
    }
    const industry = this.industries.find((ind) => ind.code === code)
    if (!industry) {
      throw new DomainError(`Industria con código "${code}" no encontrada.`)
    }
    return industry.name
  }
}
