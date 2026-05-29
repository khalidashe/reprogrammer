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
import { generateUUID } from '@/utils/uuid';
import { scheduleForBehavior } from '@/services/notifications';
import { INITIAL_LEVEL, INITIAL_LAST_LEVELUP_STREAK } from '@/services/levels';
import {
  LIBRARY_GUIDES,
  LIBRARY_PACKAGES,
  ADOPT_TEMPLATES,
  ELIMINATE_TEMPLATES,
  type AdoptTemplate,
  type EliminateTemplate,
} from '@/services/library-content';
import type { Behavior } from '@/types';
import { ContentModal } from './modals';
import type { ContentTarget } from './content-link-resolver';

interface ContentModalsApi {
  openGuide: (id: string) => void;
  openAdopt: (id: string) => void;
  openEliminate: (id: string) => void;
  openPackage: (id: string) => void;
  close: () => void;
}

function buildAdoptBehavior(template: AdoptTemplate): Behavior {
  return {
    id: generateUUID(),
    kind: 'adopt',
    title: template.title,
    pingMessage: template.pingMessage,
    practiceType: template.practiceType,
    domain: template.domain,
    libraryGuideId: template.libraryGuideId,
    window: template.window,
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    intervalMinutes: template.intervalMinutes,
    level: INITIAL_LEVEL,
    lastLevelUpStreak: INITIAL_LAST_LEVELUP_STREAK,
    createdAt: Date.now(),
    hidden: false,
    bookmarked: false,
  };
}

function buildEliminateBehavior(
  template: EliminateTemplate,
  replacementStateId: string
): Behavior {
  return {
    id: generateUUID(),
    kind: 'eliminate',
    title: template.title,
    pingMessage: template.pingMessage,
    domain: template.domain,
    replacementStateId,
    window: { from: '09:00', to: '21:00' },
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    intervalMinutes: 30,
    level: INITIAL_LEVEL,
    lastLevelUpStreak: INITIAL_LAST_LEVELUP_STREAK,
    createdAt: Date.now(),
    hidden: false,
    bookmarked: false,
  };
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

  const openPackage = useCallback(
    (id: string) => {
      const pkg = LIBRARY_PACKAGES.find((p) => p.id === id);
      if (pkg) pushTarget({ kind: 'package', pkg });
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
      const behavior = buildAdoptBehavior(template);
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
          `"${template.title}" needs the Adopt state "${adoptTemplate?.title ?? 'replacement'}" to be active.`,
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
                      const adoptBehavior = buildAdoptBehavior(adoptTemplate);
                      await addBehavior(adoptBehavior);
                      await scheduleForBehavior(adoptBehavior);
                      const elimBehavior = buildEliminateBehavior(
                        template,
                        adoptBehavior.id
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
      const behavior = buildEliminateBehavior(template, replacement.id);
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
    () => ({ openGuide, openAdopt, openEliminate, openPackage, close }),
    [openGuide, openAdopt, openEliminate, openPackage, close]
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
