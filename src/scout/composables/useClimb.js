import { computed } from 'vue';

export function useClimb(climbModel) {
  const useClimbProperty = (key) => {
    return computed({
      get: () => climbModel.value?.[key],
      set: (value) => {
        climbModel.value = { ...(climbModel.value || {}), [key]: value };
      }
    });
  };

  const climbLevel = useClimbProperty('level');
  const climbStart = useClimbProperty('start');
  const climbFailed = useClimbProperty('failed');
  const climbDismount = useClimbProperty('dismount')

  return {
    climbLevel,
    climbStart,
    climbFailed,
    climbDismount
  };
}
