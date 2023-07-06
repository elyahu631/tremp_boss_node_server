// src/resources/tremps/trempService.ts
import TrempModel from './TrempModel';
import TrempDataAccess from './TrempDataAccess';

const trempDataAccess = new TrempDataAccess();

export async function createTremp(tremp: TrempModel) {
  return await trempDataAccess.insertTremp(tremp);
}

export async function getTrempsByFilters(filters: any) {
  console.log(filters);
  
  const query = {
    creator_id: { $ne: filters.creator_id },
    tremp_time: { $gt: filters.tremp_time },
    tremp_type: filters.type_of_tremp,
  };

  return await trempDataAccess.FindTrempsByFilters(query);
}