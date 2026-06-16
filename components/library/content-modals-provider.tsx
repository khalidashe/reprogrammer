import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Alert } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import useStore from '@/store/useStore';
import { scheduleForBehavior } from '@/services/notifications';
import {
  buildBehavior,
  draftFromAdoptTemplate,
  draftFromEliminateTemplate,
} from '@/services/behavior-factory';
import {
  LIBRARY_GUIDES,
  LIBRARY_PROGRAMS,
  ADOPT_TEMPLATES,
  ELIMINATE_TEMPLATES,
  type AdoptTemplate,
  type EliminateTemplate,
} from '@/services/library-content';
import { ContentModal } from './modals';
import type { ContentTarget } from './content-link-resolver';

interface ContentModalsApi {
  openGuide: (id: string) => void;
  openAdopt: (id: string) => void;
  openEliminate: (id: string) => void;
  openProgram: (id: string) => void;
  close: () => void;
}

const ContentModalsContext = createContext<ContentModalsApi | null>(null);

export function useContentModals(): ContentModalsApi {
  const ctx = useContext(ContentModalsContext);
  if (!ctx) {
    throw new Error(
      'useContentModals must be used inside ContentModalsProvider'
    );
  }
  return ctx;
}

export function ContentModalsProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { behaviors, addBehavior } = useStore();
  const [stack, setStack] = useState<NonNullable<ContentTarget>[]>([]);

  const top = stack[stack.length - 1] ?? null;

  const pushTarget = useCallback((target: NonNullable<ContentTarget>) => {
    setStack((s) => [...s, target]);
  }, []);

  const openGuide = useCallback(
    (id: string) => {
      const guide = LIBRARY_GUIDES.find((g) => g.id === id);
      if (guide) pushTarget({ kind: 'guide', guide });
    },
    [pushTarget]
  );

  const openAdopt = useCallback(
    (id: string) => {
      const template = ADOPT_TEMPLATES.find((t) => t.id === id);
      if (template) pushTarget({ kind: 'adopt', template });
    },
    [pushTarget]
  );

  const openEliminate = useCallback(
    (id: string) => {
      const template = ELIMINATE_TEMPLATES.find((t) => t.id === id);
      if (template) pushTarget({ kind: 'eliminate', template });
    },
    [pushTarget]
  );

  const openProgram = useCallback(
    (id: string) => {
      const program = LIBRARY_PROGRAMS.find((p) => p.id === id);
      if (program) pushTarget({ kind: 'program', program });
    },
    [pushTarget]
  );

  const back = useCallback(() => {
    setStack((s) => s.slice(0, -1));
  }, []);

  const close = useCallback(() => {
    setStack([]);
  }, []);

  const addedTemplateTitles = useMemo(
    () => new Set(behaviors.map((b) => b.title)),
    [behaviors]
  );

  const handleAddAdopt = useCallback(
    async (template: AdoptTemplate) => {
      const behavior = buildBehavior(draftFromAdoptTemplate(template));
      await addBehavior(behavior);
      await scheduleForBehavior(behavior);
      close();
      Alert.alert('Added', `"${template.title}" is now on your dashboard.`);
    },
    [addBehavior, close]
  );

  const handleAddEliminate = useCallback(
    async (template: EliminateTemplate) => {
      const adoptTemplate = ADOPT_TEMPLATES.find(
        (a) => a.id === template.replacementAdoptId
      );
      const replacement = behaviors.find(
        (b) =>
          b.kind === 'adopt' &&
          (b.id === template.replacementAdoptId ||
            b.title === adoptTemplate?.title)
      );
      if (!replacement) {
        Alert.alert(
          'Add replacement first',
          `"${template.title}" needs the Adopt behavior "${adoptTemplate?.title ?? 'replacement'}" to be active.`,
          [
            { text: 'Cancel', style: 'cancel' },
            ...(adoptTemplate
              ? [
                  {
                    text: 'View Adopt',
                    onPress: () => openAdopt(adoptTemplate.id),
                  },
                  {
                    text: 'Add it',
                    onPress: async () => {
                      const adoptBehavior = buildBehavior(
                        draftFromAdoptTemplate(adoptTemplate)
                      );
                      await addBehavior(adoptBehavior);
                      await scheduleForBehavior(adoptBehavior);
                      const elimBehavior = buildBehavior(
                        draftFromEliminateTemplate(template, adoptBehavior.id)
                      );
                      await addBehavior(elimBehavior);
                      await scheduleForBehavior(elimBehavior);
                      close();
                      Alert.alert(
                        'Added',
                        `Both "${adoptTemplate.title}" and "${template.title}" are on your dashboard.`
                      );
                    },
                  },
                ]
              : []),
          ]
        );
        return;
      }
      const behavior = buildBehavior(
        draftFromEliminateTemplate(template, replacement.id)
      );
      await addBehavior(behavior);
      await scheduleForBehavior(behavior);
      close();
      Alert.alert('Added', `"${template.title}" is now on your dashboard.`);
    },
    [addBehavior, behaviors, close, openAdopt]
  );

  const onAdd = useCallback(() => {
    if (!top) return;
    if (top.kind === 'adopt') void handleAddAdopt(top.template);
    else if (top.kind === 'eliminate') void handleAddEliminate(top.template);
  }, [top, handleAddAdopt, handleAddEliminate]);

  const added =
    top && (top.kind === 'adopt' || top.kind === 'eliminate')
      ? addedTemplateTitles.has(top.template.title)
      : false;

  const api = useMemo<ContentModalsApi>(
    () => ({ openGuide, openAdopt, openEliminate, openProgram, close }),
    [openGuide, openAdopt, openEliminate, openProgram, close]
  );

  return (
    <ContentModalsContext.Provider value={api}>
      {children}
      <ContentModal
        visible={top !== null}
        target={top}
        canBack={stack.length > 1}
        added={added}
        colors={colors}
        onBack={back}
        onClose={close}
        onOpenTarget={pushTarget}
        onAdd={onAdd}
      />
    </ContentModalsContext.Provider>
  );
}
